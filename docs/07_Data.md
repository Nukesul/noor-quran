# Quran Data

## Principle

Quran accuracy comes before convenience. No verse text is ever written or edited
by hand — not even to fix what looks like a typo. Everything is copied verbatim
from a verified source, and anything bundled is generated from that source by
script and then verified against it.

---

## Architecture

```
Reader (UI)
   ↓  useSurah(number)
QuranService                     services/quran/quranService.ts
   ↓  QuranDataSource interface  services/quran/types.ts
bundled  →  alquran.cloud        services/quran/sources/
```

Sources are tried in order; the first one holding the surah wins. A source
returning `null` means "not mine". A source that genuinely fails throws, and the
error surfaces — serving different text than was asked for would be worse than
showing an error.

An offline cache slots in as a third source implementing the same interface,
with no change to the service or the Reader:

```
bundled  →  cache  →  alquran.cloud
```

The Reader receives normalised `Surah` and `Verse` objects and has no knowledge
of where they came from.

---

## Chosen source: AlQuran.cloud

**Base URL:** `https://api.alquran.cloud/v1`
**Key required:** none. **Cost:** free.

Endpoints used:

| Purpose | Endpoint |
|---|---|
| Surah in two editions, ayah-aligned | `/surah/{n}/editions/{arabic},{translation}` |
| Surah metadata (all 114) | `/surah` |
| Editions by language | `/edition?language=ru` |

Requesting both editions in one call returns them already aligned by ayah, which
avoids pairing two independently fetched lists.

### Editions

- **Arabic:** `quran-uthmani` — Tanzil Uthmani script.
- **Russian:** `ru.kuliev` — Elmir Kuliev.

Also verified present and available for a future translation picker:
`ru.osmanov`, `ru.abuadel`, `ru.porokhova`, `ru.krachkovsky`, `ru.sablukov`,
`ru.kuliev-alsaadi`, plus `ru.transliteration`.

### Alternatives considered

- **quran.com API v4** — free, no key, and the source of our surah metadata
  (it is the only verified source of Russian surah names and the `bismillah_pre`
  flag). Not used for verse text because AlQuran.cloud's paired-edition endpoint
  is a better fit for the Reader.
- **fawazahmed0/quran-api** — Unlicense, CDN-hosted static JSON, no rate limits.
  A strong future option for offline bundling; kept in reserve.

---

## Licensing

### Arabic text — Tanzil Project

Verbatim from tanzil.net:

> Permission is granted to copy and distribute verbatim copies of the Quran text
> provided here, but changing the text is not allowed. The text can be used in
> any website or application, provided that its source (Tanzil Project) is
> clearly indicated, and a link is made to tanzil.net to enable users to keep
> track of changes.

Obligations this places on us:

1. **The Arabic text must never be modified.** The one exception in code is
   stripping a leading U+FEFF byte-order mark, which is an encoding artifact and
   not part of the text. Nothing else is normalised, re-spaced, or stripped.
2. **Tanzil must be named** and **linked to tanzil.net** in the app.
   → Not yet implemented. Must ship before public release.
3. Join the Tanzil mailing list to receive text corrections.

### Translation — Elmir Kuliev

**The translation is licensed differently from the Arabic text. This is the most
important constraint in this document.**

Verbatim from tanzil.net/trans, which is where AlQuran.cloud's translations come
from:

> The translations provided at this page are for non-commercial purposes only.
> If used otherwise, you need to obtain necessary permission from the translator
> or the publisher.

And:

> If you are using more than three of the following translations in a website or
> application, we require you to put a link back to this page to make sure that
> subsequent users have access to the latest updates.

AlQuran.cloud adds: *"If you republish a translation, please attribute the
translator by name."*

| | Arabic (`quran-uthmani`) | Translation (`ru.kuliev`) |
|---|---|---|
| Commercial use | Permitted, acknowledgement expected | **Not permitted** without permission from the translator or publisher |
| Attribution | Name Tanzil, link tanzil.net | Name the translator |
| Modification | Not allowed | Not allowed |

Obligations this places on us:

1. **Noor Quran cannot be distributed commercially while bundling this
   translation** — no paid app, no paid tier — without first obtaining
   permission from Elmir Kuliev or his publisher. Tanzil cannot grant it.
   → Decide this before any monetisation. It also applies to every other Tanzil
   translation, so switching editions is not a way around it.
2. **Elmir Kuliev must be credited by name** wherever the translation is shown.
3. If a translation picker ever offers **more than three** translations, the app
   must link back to tanzil.net/trans.

→ Attribution strings are carried on each `Edition` in
`services/quran/editions.ts` so they cannot drift from the text they describe.
Displaying them is **not yet implemented**.

> **`ru.kuliev` is NOT APPROVED FOR PRODUCTION DISTRIBUTION.**
> It stays in the project for now because it is verified and the Reader depends
> on it, but it must not ship in a public release until either (a) written
> permission is obtained from Elmir Kuliev or his publisher, or (b) it is
> replaced with a translation whose licence permits redistribution. See the
> research below.

### API terms — AlQuran.cloud

Free and key-less. There is a **soft per-second, per-IP rate limit**, so a cache
is required before the app fetches at any volume. Commercial use of the corpus
needs no permission but expects acknowledgement of the source.

---

## Accuracy verification performed

Both metadata sources were fetched and compared row by row:

- 114 surahs from each source.
- **Zero mismatches** on `versesCount` and `revelationPlace` across all 114.
- Ayah counts sum to **6236** — the standard Hafs total.
- `bismillah_pre` is false for **exactly surahs 1 and 9**, independently
  confirming that Al-Fatihah's Bismillah is ayah 1 and that At-Tawbah has none.
- Al-Fatihah returns 7 ayahs with the Bismillah as ayah 1, matching our
  numbering.
- A real U+FEFF BOM was confirmed at the start of 1:1 in `quran-uthmani`.

`constants/surahIndex.ts` is generated from this verified data, not typed by
hand.

### Full sweep

Every one of the 114 surahs was fetched through the adapter and checked for:
correct ayah count, sequential ayah numbering, no empty Arabic or translation,
no surviving BOM, and correct Bismillah placement. **6236 ayahs, zero
failures.**

### Bundled text

`services/quran/data/alFatihah.ts` holds the only Quran text shipped inside the
app. **Both** its Arabic and its Russian are **generated** from the same two
editions `DEFAULT_EDITIONS` requests, so bundled and remote surah 1 are
byte-identical in both languages:

| Field | Source |
|---|---|
| `arabic` | `https://api.alquran.cloud/v1/surah/1/quran-uthmani` |
| `translation` | `https://api.alquran.cloud/v1/surah/1/ru.kuliev` |

Verified after generation by loading the compiled module and comparing all 7
ayahs against fresh fetches of both editions: JS string equality, UTF-8 byte
equality, length, sequential numbering, and no surviving BOM. **All 7 identical
in both languages.**

The Russian needed no BOM stripping and is NFC-stable; only the Arabic 1:1
carries a BOM.

**Never edit those strings by hand.** Editors silently reorder Arabic combining
marks — the previous hand-written copy had fatha before shadda where the source
has shadda before fatha, in 14 places across the 7 ayahs. It rendered
identically and was invisible in review, but it did not match the source.
Regenerate instead.

Migrating from the previous Imlaei copy changed, across the 7 ayahs:

| Change | Count |
|---|---|
| ALEF (U+0627) → ALEF WASLA (U+0671) | 14 |
| ALEF (U+0627) → SUPERSCRIPT ALEF (U+0670) | 4 |
| MADDA ABOVE (U+0653) inserted | 1 |
| shadda/fatha reordered (same characters) | 14 |

---

## Two source quirks the adapter must handle

Both were found by testing against the live API, not by reading documentation.

### 1. The Bismillah is prepended to ayah 1

`quran-uthmani` returns ayah 1 of every surah that opens with a Bismillah as
*Bismillah + space + the actual ayah*. Al-Ikhlas 112:1 arrives as
"بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ" rather than
"قُلْ هُوَ ٱللَّهُ أَحَدٌ". Surahs 1 and 9 are correctly exempt.

Left alone this is wrong twice: the Bismillah renders both in the header and
inside ayah 1, and the Arabic carries text its paired translation does not
(`ru.kuliev` returns ayah 1 without it). quran.com's independent `text_uthmani`
confirms the correct boundary.

The adapter separates them. No text is discarded — the Bismillah is still shown
by the header — so this stays within Tanzil's verbatim terms.

**Two traps in doing this, both hit during implementation:**

- **Combining-mark order.** The API returns shadda before fatha
  (U+0651 U+064E); an editor writing the same glyphs produces canonical order
  (U+064E U+0651). Identical text, identical rendering, but a raw `startsWith`
  silently fails. Comparison must be on NFC-normalised forms.
- **NFC changes length.** Normalising composes hamza forms, so in An-Naba (78)
  and Al-Kawthar (108) the normalised string is *shorter* than the original and
  indices taken from it cut in the wrong place. The adapter therefore locates
  the boundary in the original's own coordinates — the space ending the
  Bismillah's fourth word — and normalises only for the equality test.

If the expected prefix is not found, the text is returned untouched. A
double-rendered Bismillah is visible and recoverable; a truncated ayah is not.

### 2. Rate limiting is real

A rapid 114-surah sweep returned **HTTP 429**. The adapter reports this as
`reason: 'rate-limited'`, distinct from `network`, because it is the one failure
expected to succeed on retry. **An offline cache is required before the app
fetches at any volume.**

---

## Russian translation licensing research

Researched 2026-08-13 against primary sources — licence pages and statutory text,
not summaries. **Not legal advice; confirm with a lawyer before release.**

### The rule that governs everything here

**A free API does not grant rights to the text it serves.** Three separate
permissions have to line up, and they come from different parties:

1. the **API operator's** terms (may I call this endpoint?),
2. the **distributor's** terms (may I redistribute the file?),
3. the **translator's copyright** (may anyone redistribute this work at all?).

Every option below was checked against all three. Two of the most convenient
sources fail at layer 2 or 3 despite being free at layer 1.

### Comparison

| Translation | Translator | Source | Commercial | Free-app distribution | Bundle / cache offline | API | In-app attribution required |
|---|---|---|---|---|---|---|---|
| **Rowwad** ⭐ | Rowwad Translation Center | QuranEnc | Not restricted | **Yes** | **Yes** | Yes | Publisher + QuranEnc.com + version |
| Sablukov | G. S. Sablukov (d. 1880) | public domain | Yes | Yes | Yes (re-typeset) | via Tanzil only | None legally |
| Kuliev | Elmir Kuliev (b. 1975) | Tanzil | **No** | Non-commercial only | Permitted non-commercially | Yes | Translator name |
| Kuliev + as-Saadi | Kuliev / as-Saadi | Tanzil | **No** | Non-commercial only | Permitted non-commercially | Yes | Translator name |
| Abu Adel | Abu Adel | Tanzil | **No** | Non-commercial only | Permitted non-commercially | Yes | Translator name |
| Osmanov | M.-N. Osmanov (d. 2015) | Tanzil | **No** | Non-commercial only | Permitted non-commercially | Yes | Translator name |
| Porokhova | V. Porokhova (d. 2019) | Tanzil | **No** | Non-commercial only | Permitted non-commercially | Yes | Translator name |
| Krachkovsky | I. Krachkovsky (d. 1951) | Tanzil | **No** | Non-commercial only | Permitted non-commercially | Yes | Translator name |
| Al-Muntahab | Ministry of Awqaf, Egypt | Tanzil | **No** | Non-commercial only | Permitted non-commercially | Yes | Publisher name |
| *(any via quran.com)* | — | quran.com API | **No** | **No** | **No** | Yes | — |
| *(any via fawazahmed0)* | — | CDN JSON | Unresolved | Unresolved | Unresolved | Yes | — |

"Non-commercial only" above is Tanzil's blanket condition on its translations
page; it applies to every translation distributed from there regardless of who
translated it.

### Rowwad Translation Center, via QuranEnc — recommended

**Primary source:** the Terms and Policies notice on quranenc.com, verbatim:

> Contents of the translations can be downloaded and re-published, with the
> following terms and conditions:
> 1. No modification, addition, or deletion of the content.
> 2. Clearly referring to the publisher and the source (QuranEnc.com).
> 3. Mentioning the version number when re-publishing the translation.
> 4. Keeping the transcript information inside the document.
> 5. Notifying the source (QuranEnc.com) of any note on the translation.
> 6. Updating the translation according to the latest version issued from the
>    source (QuranEnc.com).
> 7. Inappropriate advertisements must not be included when displaying
>    translations of the meanings of the Noble Quran.

This is the only Russian option found whose licence **affirmatively grants
re-publication**. Note what is *absent*: no non-commercial clause. Every
condition is satisfiable by an app that displays credits and ships no ads.

QuranEnc ("Encyclopedia of the Noble Quran") is run by the Rowwad Translation
Center with the Tafsir Center for Quranic Studies and Noor International.

Verified working:

- `GET https://quranenc.com/api/v1/translation/sura/russian_rwwad/{n}` — returns
  `arabic_text`, `translation`, and `footnotes` per ayah.
- Ayah counts correct for surahs 1, 2, 9, 112, 114 (7 / 286 / 129 / 4 / 6).
- Offline-ready: a full SQLite database is published at
  `https://quranenc.com/downloads/sqlite/russian_rwwad.sqlite` (~1.6 MB).

**Open problems that must be resolved before adopting it:**

1. **It is not in QuranEnc's catalogue.** `/api/v1/translations/list` returns 74
   translations and contains **no `ru` entry**, yet `russian_rwwad` serves data
   and has a SQLite download. Its status is therefore ambiguous — possibly
   unreleased or in preparation.
2. **No discoverable version number**, which condition 3 explicitly requires when
   re-publishing. It cannot be satisfied from the API today.
3. Condition 6 (stay current with the latest version) implies a version check,
   which the data layer has no concept of yet.

→ **Contact QuranEnc and confirm the Russian translation's status and version
number before bundling it.** Conditions 3 and 6 cannot be honoured until then.

Text differs noticeably from Kuliev — 1:1 reads "С именем Аллаха, Всемилостивого,
Милующего[1]." Footnote markers are inline in the text with a separate
`footnotes` field, which the Reader currently has no way to render.

### Public domain — Sablukov

The only option needing nobody's permission. **Gordy Semyonovich Sablukov,
1804–1880**; his translation, the first published Russian rendering from Arabic,
appeared in 1878. Under Article 1281(1) of the Civil Code of the Russian
Federation (life + 70 years) protection expired on 1 January 1951. Public domain
worldwide by any calculation.

Two caveats:

- **Public domain in the work ≠ free use of someone's file.** Tanzil's
  non-commercial terms still attach to *Tanzil's* copy. To rely on public domain
  status the text must come from a source that asserts no rights over it, or be
  re-typeset from the original edition.
- **The language is 1870s Russian.** Archaic and hard going for a modern reader.
  Legally safest, practically weakest — a poor fit for a calm reading app.

### Krachkovsky is NOT public domain — a common mistake

Frequently assumed free because he died in 1951, which under a plain life + 70
reading would have expired in 2022. Two statutory provisions say otherwise.
Article 1281 of the Civil Code, verbatim:

> 3. Исключительное право на произведение, обнародованное после смерти автора,
> действует в течение семидесяти лет после обнародования произведения, считая с
> 1 января года, следующего за годом его обнародования […]

> 5. Если автор работал во время Великой Отечественной войны или участвовал в
> ней, срок действия исключительного права, установленный настоящей статьей,
> увеличивается на четыре года.

Krachkovsky (1883–1951) had his translation published **posthumously, in 1963**.
Paragraph 3 therefore runs the term from publication, not death: 70 years from
1 January 1964 → **2034**. Paragraph 4's war extension plausibly adds four more →
**~2038**, as he worked as an academic through the war.

**Treat Krachkovsky as fully protected.** Do not bundle it.

### Sources that cannot launder a licence

**quran.com API.** Free to call, but its terms forbid exactly what we would need.
Section 5.1: *"the Service, and any Content…are the sole property of
Quran.com"*. Section 1.4 permits use *"for individual, noncommercial,
informational purposes only"*, and section 2.3 forbids reproducing or
distributing content without written permission. **Usable for metadata lookups;
not a redistribution source for translation text.** (Our surah index came from
its `chapters` endpoint — factual metadata such as ayah counts, not creative
text, and independently cross-checked. Worth revisiting if we ever redistribute
more than facts.)

**fawazahmed0/quran-api.** Published under the Unlicense, which reads *"This is
free and unencumbered **software** released into the public domain."* It
dedicates the author's rights **in the software** — it cannot dedicate rights in
third-party translations he does not own. His own References list includes
`tanzil.net/trans`, and he writes that donations should go *"directly to the
authors and Islamic/dawah publishers who have worked so hard to make these
translations"*, acknowledging the texts are not his. **The Unlicense does not
override Tanzil's non-commercial terms or any translator's copyright.** This is
the clearest illustration of the rule at the top of this section.

### Conclusion

- **Safest with a usable modern register:** Rowwad via QuranEnc — pending the
  catalogue/version questions above.
- **Safest outright:** Sablukov (public domain), but the archaic language makes it
  unsuitable as a default.
- **Must not be bundled in a public release:** Kuliev and every other
  Tanzil-sourced translation, all quran.com-sourced text, and Krachkovsky.
- **A free app can ship legally today** on Tanzil terms *provided it is genuinely
  non-commercial* — no paid tier, no ads, nothing sold — and credits each
  translator. That forecloses monetisation permanently, which is why Rowwad is
  the better foundation.

---

## Second source: QuranEnc (Rowwad Russian)

Integrated as an **additional** source. It is not the default, nothing is
bundled from it, and `ru.kuliev` is untouched.

### Endpoint

```
GET https://quranenc.com/api/v1/translation/sura/russian_rwwad/{surahNumber}
```

Free, no key. Errors are plain **HTTP 404 with an empty body** — verified for an
out-of-range surah (115, 0) and an unknown translation key.

### Response structure

```json
{ "result": [
  { "id": "1", "sura": "1", "aya": "1",
    "arabic_text": "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
    "translation": "С именем Аллаха, Всемилостивого, Милующего[1].",
    "footnotes": "[1] Здесь и далее Имена Аллаха пишутся…" }
] }
```

**Every field is a string, including `sura` and `aya`** — the adapter converts
and then checks the result is sequential. `footnotes` is present on every ayah
but empty on most.

Both an Arabic text and a translation arrive in one response, so QuranEnc is a
*pair* source. Its Arabic is **not** Tanzil's: it writes sukun as U+06E1 where
Tanzil uses U+0652. It is therefore given its own edition identity
(`ARABIC_QURANENC`), and the adapter refuses any request that pairs Tanzil's
Arabic with the Rowwad translation rather than quietly substituting one for the
other.

Unlike AlQuran.cloud, this source needs **no Bismillah correction** — 2:1 is
"الٓمٓ", not the Bismillah plus "الٓمٓ" — and no BOM was observed.

### Publisher, source, version

| | |
|---|---|
| Translator | Rowwad Translation Center |
| Publisher / source | QuranEnc.com (Encyclopedia of the Noble Quran) |
| Version | **None published** |
| Distribution status | `permission-required` |

**The version is the blocker.** QuranEnc's condition 3 requires the version
number to be shown when republishing, and condition 6 requires staying current
with the latest version. Neither can be satisfied: `russian_rwwad` serves data
but is **absent from `/api/v1/translations/list`**, which returns 74 translations
with no `ru` entry at all. No version is discoverable through any endpoint
tried.

So `RUSSIAN_ROWWAD` is marked `permission-required` — **not** because
redistribution is forbidden (QuranEnc's terms permit it, with no non-commercial
clause), but because we cannot yet meet the conditions attached. No version
number has been invented. `isProductionRedistributable(RUSSIAN_ROWWAD)` returns
**false**.

→ **Next step is a question to QuranEnc, not code:** confirm the Russian
translation's catalogue status and its version number.

### Footnotes

Rowwad is the first edition with footnotes, so `Verse` gained one optional
field, `footnotes?: string`. Nothing else changed.

Footnote text is stored verbatim, and the `[n]` markers stay **inline in the
translation**. Removing them would mean editing the translation, which every
licence here forbids. Ayahs without a footnote get `undefined`, not an empty
string, so presence is testable.

Observed frequency: 1 of 7 ayahs in surah 1, 19 of 286 in surah 2, 0 of 6 in
surah 114. Marker count matched footnote count exactly in every case.

**No footnote UI is designed.** The Reader does not render this field; the data
is preserved so the design decision can be made later on real content.

### Attribution required

Publisher and source (QuranEnc.com) must be shown, plus the version once known,
and the app must carry no inappropriate advertising. Carried on the edition as
`Перевод: Rowwad Translation Center · Источник: QuranEnc.com`, with `sourceUrl`
`https://quranenc.com`. **Not yet displayed anywhere.**

### Production readiness

**Not production-ready.** Blocked on the version number and catalogue status
above. Usable for development and evaluation today.

---

## UI localization

**The interface is localized. The Quran is not.** These are deliberately
separate systems, and changing the interface language never changes which Quran
edition is displayed.

| | |
|---|---|
| Supported | `ru` (Русский), `ky` (Кыргызча), `en` (English) |
| Default | `ru` — the interface was written in Russian first |
| Storage key | `noor-quran:language` |
| Dependencies | none — a small typed layer, no i18n library |

Strings live in `locales/{ru,ky,en}/common.ts` and are read through
`useTranslation()`. `AppStrings` in `locales/types.ts` declares every key as an
exact interface, so a pack that misses a key or invents one **fails to compile**
— that, not a runtime check, is what keeps the three languages in step.

Ayah counts are a per-language function rather than a string, because the rule
genuinely differs: Russian has three plural forms, English two, Kyrgyz none
after a numeral ("7 аят").

### What is NOT included

- **No English Quran translation. No Kyrgyz Quran translation.** The Quran
  translation remains `ru.kuliev` in every interface language. Someone reading
  with the English interface still sees the Russian Kuliev translation under the
  Arabic. Adding Quran translations is a separate milestone with its own
  licensing work.
- `DEFAULT_EDITIONS` is untouched.

### Storage independence

Language and reading progress use separate keys — `noor-quran:language` and
`noorquran.readingPosition.v1` — and separate load/save paths. Verified: saving
a language does not disturb a saved position, and vice versa. Both fall back to
their own default (`ru`, and Al-Fatihah 1:1) when storage is unavailable,
missing, or holds anything invalid.

### Surah names across languages

`locales/ru/surahs.ts` remains the single reviewed Russian table and was not
modified. `locales/surahName.ts` only chooses which existing source to read:

| Language | Source | Example |
|---|---|---|
| `ru` | The reviewed Cyrillic table | Аль-Фатиха |
| `ky` | **The same Russian Cyrillic table** | Аль-Фатиха |
| `en` | Verified Latin transliteration from `SURAH_INDEX` | Al-Fatihah |

**Kyrgyz surah names are a documented placeholder, not a Kyrgyz translation.**
No reviewed Kyrgyz name table exists, and inventing 114 transliterations is
exactly the kind of unverified Quran-adjacent data this project refuses to
create. Kyrgyz and Russian share the script, so the reviewed names are readable
as-is until a Kyrgyz table is authored and reviewed. English uses the Latin
transliteration that was already verified against two independent sources.

---

## Surah display names

**Source of truth: `locales/ru/surahs.ts`.** Both the Reader header and the
surah list call `surahNameRu(surah)`, so they cannot disagree.

These are **transliterations** of the Arabic names ("Аль-Фатиха"), not
translations of their meaning ("Открывающая Коран").

### Why this table is hand-authored

It is the only content in the project not derived from a verified source,
because **no source provides it** — verified absent, not merely unsearched:

| Source | What it gives |
|---|---|
| quran.com `chapters?language=ru` | Russian *meaning* — "Открывающая Коран" |
| AlQuran.cloud `/surah` | Latin transliteration + English meaning |
| QuranEnc | no surah-name endpoint |
| fawazahmed0 `info.json` | Latin transliteration |

Conventions followed, matching Russian Islamic literature:

- The definite article is "Аль-", hyphenated.
- Sun letters assimilate: Ан-Нас, Ат-Тауба, Аш-Шамс, Аз-Зумар — not Аль-Нас.
- Moon letters do not: Аль-Фатиха, Аль-Кахф, Аль-Мульк.
- ث renders as "с" (Аль-Каусар), ذ as "з" (Аз-Зарият).
- Names without the article stay bare: Юнус, Марьям, Лукман.

Each entry carries its verified Latin transliteration as an inline comment so
the two can be checked against each other during review.

**Needs native review before release.** Transliteration conventions vary between
Russian editions; this table reflects one consistent choice, not a canonical
standard. It affects display labels only — never Quran text, ayah counts, or
revelation type, all of which still come from the verified `SURAH_INDEX`.

### `Surah.name` was removed

Each data source used to set its own display name: the bundled Al-Fatihah said
"Аль-Фатиха" while both remote sources fell back to the Latin transliteration,
and the surah list showed the Russian meaning from a third field. Three
producers, three answers for one surah.

`Surah` no longer carries a name at all. There is one lookup, in one file, and
no way for a source to disagree with the UI.

### Verification

All 114 checked: present, non-empty, pure Cyrillic, no duplicates. The article
prefix of every name was checked against the verified Latin transliteration —
95 surahs with a definite article all assimilate correctly, and the 19 bare
names carry no article. `surahNameRu` falls back to the Latin transliteration
if a number is ever missing.

---

## Licensing in code

The findings above are no longer only prose. Each `Edition` in
`services/quran/editions.ts` now carries its own terms, so the constraint sits
next to the text it governs instead of in a document that has to be remembered.

`Edition` (in `types/quran.ts`) gained three fields:

| Field | Meaning |
|---|---|
| `distribution` | `'redistributable'` · `'non-commercial-only'` · `'permission-required'` |
| `version?` | Text version where the source publishes one. Undefined is normal — never guess |
| `sourceUrl?` | URL to link where the licence requires a link, not just a name |

Current values:

| Edition | `distribution` | `version` | `sourceUrl` |
|---|---|---|---|
| `quran-uthmani` | `redistributable` | — | `https://tanzil.net` |
| `ru.kuliev` | `non-commercial-only` | — | `https://tanzil.net/trans/` |
| `quranenc-arabic` | `permission-required` | — | `https://quranenc.com` |
| `russian_rwwad` | `permission-required` | — | `https://quranenc.com` |

No source publishes a version identifier, so all four are undefined. `version`
exists because QuranEnc's terms require the version to be shown when
republishing — the field is ready for the day an edition supplies one, and is
the reason Rowwad cannot yet be marked redistributable.

`isProductionRedistributable(edition)` answers whether an edition's text may ship
in a production release: true only for `'redistributable'`. It is written as an
exhaustive `switch` rather than an equality check so that adding a new
distribution status fails to compile until someone decides what it means —
verified: a fourth value produces `TS2366` under `strict`. A `default` branch
would answer silently, and the safe-looking answer is not always right; a
public-domain status, for instance, *would* be redistributable.

Today `isProductionRedistributable(DEFAULT_EDITIONS.translation)` returns
**false**, which is the correct and intended answer while Kuliev is the bundled
translation.

Nothing calls the helper yet — no release gate, no UI. It exists so the next
milestone has something to call.

**This encodes only the terms recorded above. It is not legal advice and does not
account for jurisdiction.**

---

## Known limitations

1. ~~Bundled Al-Fatihah is Imlaei orthography; the API serves Uthmani.~~
   **Resolved.** The bundled Arabic is now generated from
   `quran-uthmani` and verified byte-identical to the remote edition across all
   7 ayahs. See "Bundled text" below.
2. ~~The bundled translations are still hand-written.~~ **Resolved.** Generated
   from `ru.kuliev` and verified byte-identical across all 7 ayahs. The
   hand-written copy had written "путём" where Kuliev has "путем" (U+0451 vs
   U+0435) in ayahs 6 and 7.
3. **Commercial distribution is blocked while this translation is bundled** —
   see Licensing above. Needs a decision from the translator or publisher, not
   an engineering fix.
4. ~~No Cyrillic surah names.~~ **Resolved.** All 114 now come from
   `locales/ru/surahs.ts`, the single source for display names.
   **Still needs native review before release** — see "Surah display names".
5. **No offline cache yet**, so any surah other than Al-Fatihah needs network.
6. **Attribution is stored but not displayed.** Required before release.

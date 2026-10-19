> Latest scope correction, 14 October 2026: Custom URN handling applies only to Kingdom of Gaming. Earlier broad integration confirmations below are superseded on that point. American Elements includes Drupal/ecommerce development and product catalog presentation; its public site shows product search, cart, sign-in and quote-request journeys.

# Project website review

Reviewed 13 October 2026. All 12 URLs were read through public web retrieval (BIO Middle East through search retrieval after its initial open failed). Chrome also inspected the rendered homepages and requested the public www variants where the first URL returned HTTP 403. Raw browser observations are in `project-sites.json`.

Danyal confirmed that he worked on all 12 websites in Drupal. He additionally confirmed Swapcard, custom UTM, custom URN, and API integrations for all except Tahaluf and American Elements. These implementation contributions come from Danyal's first-hand account; public homepage inspection alone cannot verify private backend integrations, ownership, project dates, or the implementation used during his involvement. The portfolio describes him as a development contributor and does not claim sole delivery or invented measurable outcomes.

| Project | Public context | Browser motion observations |
| --- | --- | --- |
| [LEAP East](https://leapeast.com/) | Hong Kong technology event | Public content retrieved; supplied hero screenshot used for presentation |
| [LEAP](https://onegiantleap.com/) | Technology event | Chrome blocked by HTTP 403; motion unconfirmed |
| [Black Hat MEA](https://blackhatmea.com/) | Cybersecurity conference and exhibition | Chrome blocked by HTTP 403; motion unconfirmed |
| [DeepFest](https://deepfest.com/) | Artificial intelligence event | Chrome blocked by HTTP 403; motion unconfirmed |
| [Tahaluf](https://tahaluf.com/) | Event organiser corporate website | Chrome blocked by HTTP 403; motion unconfirmed |
| [Cityscape Global](https://cityscapeglobal.com/) | Real estate event | Chrome blocked by HTTP 403; motion unconfirmed |
| [Umrah & Ziyarah Forum](https://umrah-ziyarah.com/) | Pilgrimage and travel industry forum | Playing, muted autoplay video hero; UTM parameters propagated in navigation |
| [BIO Middle East](https://biomiddleeast.com/) | Biotechnology and life sciences event | No video elements or active native CSS animation observed in the sampled homepage state; this does not establish that the entire site has no motion |
| [Global Water Sustainability Conference](https://idwsc.com/) | Water sustainability conference | Chrome blocked by HTTP 403; motion unconfirmed |
| [Red Sea Yacht Show](https://redseayachtshow.com/) | Yacht show | 13 video elements, forward/reverse segments and looping scenes; active `waveDrift` and `float` CSS animations |
| [Kingdom of Gaming](https://kingdomofgaming.com/) | Gaming industry and culture event | Playing autoplay/loop animated video hero |
| [American Elements](https://www.americanelements.com/) | Advanced materials manufacturer | Chrome blocked by HTTP 403; motion unconfirmed |

The four accessible websites expose Drupal in their rendered runtime. The other seven are labeled Drupal using Danyal's confirmation, not the challenge page's runtime. A missing public Swapcard link is not evidence of absent backend integration. BIO Middle East also publicly advertises partneringONE; this does not establish the implementation of Danyal's stated Swapcard contribution.

Screenshots show current public sites, not a preserved historical version of Danyal's work. Four local captures are now monochrome, with consent containers hidden locally and bottom privacy widgets kept below the captured area. Danyal supplied eight screenshots covering LEAP, LEAP East, Black Hat MEA, DeepFest, Tahaluf, Cityscape Global, IDWSC and American Elements. Those use monochrome ImageGen cleanup edits. All 12 projects now have monochrome screenshot previews. Public automated inspection of the seven blocked sites remains unconfirmed. The reproducible capture script and latest status are in `scripts/capture-project-previews.mjs` and `project-captures.json`. All project cards use screenshot previews. Cleaned supplied screenshots are presentation edits with reconstructed popup backgrounds, rather than raw automated captures. The accepted 30-second portfolio hero video is unchanged.

LEAP East was added at Danyal's request, and he explicitly confirmed all four integrations: Swapcard, custom UTM, custom URN, and external APIs. This brings the portfolio to 12 projects and 10 integrated event platforms.

Mobile previews were added for all 12 projects: five real mobile browser captures and seven user-authorized generated concepts. The concept label and image alternative text distinguish the two in the site. Asset provenance is documented in ASSET_NOTES.md.

## Additional owner projects — 14 October 2026

- [Money20/20 Middle East](https://money2020middleeast.com/): public homepage reviewed as a fintech event platform. Danyal confirmed Drupal work with Swapcard, custom UTM, custom URN and API integrations.
- [Cityscape West KSA](https://cityscapewestksa.com/): public homepage content reviewed as a real estate event platform for western Saudi Arabia. Listed for Drupal development; the four integration claims are not attached to this entry.

Both entries use cleaned owner-supplied desktop screenshots and illustrative mobile concepts. The owner's first five project priorities remain unchanged.

## Language availability — 19 October 2026

Public English and Arabic content was verified for LEAP (earlier-edition Arabic event page), Black Hat MEA (Arabic landing page), Cityscape Global, Umrah & Ziyarah Forum, Cityscape West KSA (Arabic enquiry form, not a fully translated homepage), BIO Middle East, IDWS, Red Sea Yacht Show and Tahaluf. LEAP East links from its English site to a separate Chinese edition at https://www.leapeast.com.cn/. Exact reviewed URLs and scope notes are in `project-languages.json`.

The mere existence of `/ar`, `lang="ar"` or `dir="rtl"` is not treated as evidence of actual translated content: Kingdom of Gaming and Money20/20 returned English text on the sampled Arabic routes. DeepFest's retrieved `/ar` content was English and stale while direct requests were blocked. American Elements exposes Google Translate language options; a native Arabic edition was not verified. These four entries therefore do not receive verified language badges or Arabic links. This is a public feature review, not proof of the contributor's personal responsibility for translation or a specific backend multilingual module.

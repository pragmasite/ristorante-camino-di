# SiteForge Website Generation

## Instructions

Build the website by following these instructions.

You must do it simply by writing a config.yaml using the SiteForge website creation template.

The SiteForge template is available in the current directory.

### How to Build

```bash
npm run build
```

### Examples

Check example configs for inspiration: `../examples/*/config.yaml`

You can (only if needed) modify the code for customization purpose.

---

## Generation Rules

### Language
- Default language of the website should be: **it** (detected from postal code 6977)
- Ticino (postal codes 65xx, 66xx, 68xx, 69xx) → Italian
- Romandie (postal codes 1xxx, 2xxx) → French
- Rest of Switzerland → German
- Website should be translated to other language (with separate urls (/de, /fr, /it, /en), when the spoken languages are mentioned).
  - ALWAYS include at least one second language, if unclear which, use english.

### Disclaimer
- The website should show a modal at the beginning with a disclaimer saying:
  - This website is a draft preview
  - It is not referenced on Google
  - It may contain errors or inaccuracies
  - Include a button to dismiss the modal

### Contact
- Website should NOT have a contact form
- Display contact information (phone, email, address) directly instead

### Logo
- Check the logo image (if any), and use it only if it is not too old-fashioned.
  - e.g. a business card image as logo

### Images

#### Step 1: Download
If images are URLs, download them to ./assets/

#### Step 2: Analyze
```bash
node pipeline/analyze-images.js ./assets/
```

#### Step 3: Read analysis
Read `./assets/image-analysis.json` to understand each image.

#### Step 4: Decide placement
Based on the analysis data, decide how to use each image:
- Hero: needs excellent/good quality, strong composition, relevant mood
- Gallery: good+ quality photos showing work/products
- About: images of people, workspace, behind-the-scenes
- Logo: only if type is "logo" (not business_card) with good+ quality
- Omit: poor quality, business card scans, irrelevant content

#### Step 5: Use alt_text
Always include the alt_text from the analysis for accessibility.

### Additional Details
- If the business information are not detailed enough, do a websearch / webfetch.
  - to ensure the correct business information are retrieved, always double check the business name and address (and use both in search)

---

# Business Information

## Ristorante Camino di Dawodi
**Type:** LocalBusiness

### Contact Information
- **Address:** Via Massago 3, 6977 Ruvigliana, CH
- **Phone:** +41912110150
- **Email:** info@rist-camino.ch
- **Website:** https://it.tripadvisor.ch/Restaurant_Review-g188095-d2161564-Reviews-Ristorante_Camino-Lugano_Canton_of_Ticino_Swiss_Alps.html
- **Coordinates:** 46.004006, 8.977973

### Opening Hours
- Monday: 17:00-23:00
- Wednesday: 17:00-23:00
- Thursday: 17:00-23:00
- Friday: 17:00-23:00
- Saturday: 11:00-14:30
- Saturday: 17:00-23:00
- Sunday: 11:00-14:30
- Sunday: 17:00-23:00

### About
"Passion and territoriality, from sourcing raw materials locally from small producers to selecting artisan wineries."Our philosophy is to promote local products, favoring artisanal production and homemade preparations. We carefully select the ingredients for our dishes, sourcing them directly from the producer whenever possible: stories of mountain pastures, local producers, and passion for their products. For us at Il Camino, craftsmanship is a fundamental part of maintaining local tradition and culture. To add our own personality, we strive every single day to prepare the best dishes with the freshest products possible, respecting their characteristics and using modern culinary techniques to give them our innovative twist.

### Category
ruvigliana

### Social Media
- https://www.facebook.com/caminoruvigliana
- https://www.instagram.com/camino_ruvigliana?hl=it

### Media
- **Logo:** https://bin.staticlocal.ch/localplace-logo/48/48e197c3b9f032e92bb9b72631450d2ffc3cad85/download.png
- **Images (10 total):**
  - https://bin.staticlocal.ch/localplace-images/18/186d23df959b7b15a0c67136043d3675f9c86c1b/IMG-20211110-WA0005.jpg
  - https://bin.staticlocal.ch/localplace-images/01/0167134a6298ac461ecafecda34976e034039ba1/IMG-20211110-WA0004.jpg
  - https://bin.staticlocal.ch/localplace-images/51/510cf1b6516eff8867ed56953e7d677b2a002d84/IMG-20211110-WA0006.jpg
  - https://bin.staticlocal.ch/localplace-images/da/dad02566fbd96cce0e3dd72742e3a6b62d06b76b/IMG-20211110-WA0007.jpg
  - https://bin.staticlocal.ch/localplace-images/2a/2a5e1d4bdb1d40e2f753fdcf24dfae7ba9d88397/IMG-20211110-WA0008.jpg
  - https://bin.staticlocal.ch/localplace-images/a4/a4436af6c1f64c07aaf422f84af5f13d48a7ceb9/IMG-20211110-WA0010.jpg
  - https://bin.staticlocal.ch/localplace-images/92/92140815506eb3ca5be8949e1c68a842e5991efa/IMG-20211110-WA0009.jpg
  - https://bin.staticlocal.ch/localplace-images/74/746dec235e02571b2007ec66e251cd2990203bf2/IMG-20211110-WA0011.jpg
  - https://bin.staticlocal.ch/localplace-images/39/39c10c3b3657bfa7077a59475a50977a1a3dfa16/IMG-20211110-WA0013.jpg
  - https://bin.staticlocal.ch/localplace-images/b2/b243286ae4565c31ccdb65c426f9e83707cebd88/IMG-20211110-WA0012.jpg

## Slug
- URL slug: ristorante-camino-di

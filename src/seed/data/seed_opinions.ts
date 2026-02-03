import { SEED_TAGS } from './seed_tags';
const SEED_IMAGES = [
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088372/torval_duguvi.webp', // 0: linus
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088073/js_ros88d.webp', // 1: javaScript
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088074/ledzepelin_mgwul9.webp', // 2: ledZeppelin
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088073/jimmy-page_t5sftp.webp', // 3: Jimmy page
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088072/gilmour_ngxbm1.webp', // 4: David gilmoure
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088070/foofigthers_sxygwn.webp', // 5: foofighters
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088068/coldplay_gogbor.webp', // 6: coldplay
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088072/goku_jtd1za.webp', // 7: goku
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088374/vegueta_ixncce.jpg', // 8: vegueta777
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770089133/karmaland_cfvwts.webp', // 9: Karmaland
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088374/tyson_fiohcx.webp', // 10: tyson
  'https://res.cloudinary.com/dqclkzb8r/image/upload/v1770088069/egipt_i3ndoq.webp', // 11: egipto
];

export const OPINION_TEMPLATES = [
  // --- LINUS TORVALDS & TECH ---
  {
    title: 'The mind behind Linux',
    content:
      "People forget that #Linus Torvalds didn't just create Linux, he also gave us Git. Imagine a world without version control? He might be harsh sometimes, but he is a genius.",
    imageIndex: SEED_IMAGES[0], // Linus
    tags: [SEED_TAGS[0]],
  },
  {
    title: 'Nvidia, f**k you!',
    content:
      'That moment when #Linus flipped off Nvidia at the conference remains iconic. It shows how passionate he is about open source compatibility. Linus Torvalds es un ingeniero de software finlandés, nacido el 28 de diciembre de 1969 en Helsinki, Finlandia. Es conocido principalmente por crear el núcleo Linux y el sistema de control de versiones Git.',
    imageIndex: null,
    tags: [SEED_TAGS[0]],
  },

  // --- JAVASCRIPT ---
  {
    title: 'JavaScript runs the world',
    content:
      'Love it or hate it, you cannot escape it. From React to backend with Node.js. It is messy, sure, but the ecosystem is unmatched. #javascript',
    imageIndex: SEED_IMAGES[1], // JS
    tags: [SEED_TAGS[2]],
  },
  {
    title: 'TypeScript saved my sanity',
    content:
      'Going back to vanilla JavaScript after using TypeScript feels like driving without a seatbelt. Types are necessary for any serious project.#typescript',
    imageIndex: null,
    tags: [SEED_TAGS[1]],
  },

  // --- MUSIC: LED ZEPPELIN, JIMMY PAGE ---
  {
    title: 'The greatest riff master',
    content:
      'Jimmy Page isn\'t just a guitarist; he is an orchestrator of guitars. The production on "Whole Lotta Love" is still mind-blowing today. #ledzeppelin',
    imageIndex: SEED_IMAGES[3], // Jimmy Page
    tags: [SEED_TAGS[3]],
  },
  {
    title: "Stairway to Heaven isn't forbidden",
    content:
      "People say don't play it in guitar stores, but honestly, it is a masterpiece. Led Zeppelin IV is a perfect album from start to finish. #ledzeppelin Led Zeppelin fue un grupo británico de rock fundado en Londres en 1968.",
    imageIndex: SEED_IMAGES[2], // Led Zeppelin Band
    tags: [SEED_TAGS[3]],
  },

  // --- MUSIC: DAVID GILMOUR (PINK FLOYD) ---
  {
    title: 'Feeling over speed',
    content:
      'David Gilmour proves you don\'t need to play 1000 notes per second to be the best. The solo in "Comfortably Numb" has more emotion in one bend than most shredders have in a career. #davidgilmour',
    imageIndex: SEED_IMAGES[4], // Gilmour
    tags: [SEED_TAGS[4]],
  },
  {
    title: 'The Black Strat',
    content:
      'The tone on "Shine On You Crazy Diamond" is pure magic. Gilmour\'s bending technique is simply out of this world. #davidgilmour, #pinkfloyd',
    imageIndex: SEED_IMAGES[4], // Gilmour
    tags: [SEED_TAGS[4], SEED_TAGS[5]],
  },

  // --- MUSIC: FOO FIGHTERS ---
  {
    title: 'Dave Grohl is the nicest guy in rock',
    content:
      'From Nirvana to Foo Fighters. The energy they bring to live shows is insane. "Everlong" is arguably the best rock song of the 90s. #foofighters',
    imageIndex: null,
    tags: [SEED_TAGS[6]],
  },
  {
    title: 'Rest in power Taylor',
    content:
      "Foo Fighters won't be the same without Taylor Hawkins, but the tribute concerts showed how much love there is for him. A legend. #foofighters",
    imageIndex: SEED_IMAGES[5], // Foo Fighters
    tags: [SEED_TAGS[6]],
  },

  // --- MUSIC: COLDPLAY ---
  {
    title: 'A Head Full of Dreams tour',
    content:
      'Say what you want about Coldplay being "pop", but their live shows with the wristbands (Xylobands) are a visual spectacle. #coldplay',
    imageIndex: SEED_IMAGES[6], // Coldplay
    tags: [SEED_TAGS[7]],
  },
  {
    title: 'Old Coldplay was better',
    content:
      'Parachutes and A Rush of Blood to the Head were peak melancholy. I miss that sound compared to the new synth-pop stuff.',
    imageIndex: null,
  },

  // --- MUSIC: 50 CENT ---
  {
    title: 'Get Rich or Die Tryin',
    content:
      'One of the best debut albums in hip-hop history. "Many Men" hits different when you know the backstory. 50 Cent defined an era. #50cent #rap',
    imageIndex: null, // CORREGIDO: No tenías imagen de 50 Cent (antes apuntaba a Goku)
    tags: [SEED_TAGS[8], SEED_TAGS[9]],
  },
  {
    title: 'Vitamin Water genius',
    content:
      '50 Cent is a marketing genius. He made more money selling Vitamin Water than with his music. A true businessman. #50cent',
    imageIndex: null,
    tags: [SEED_TAGS[8]],
  },

  // --- ANIME & YOUTUBE: GOKU & VEGETTA777 ---
  {
    title: 'UI Goku vs Superman',
    content:
      'The eternal debate. With Mastered Ultra Instinct, I think Goku finally takes the win. His speed is just unrelated to physics now. #goku #dragonball',
    imageIndex: SEED_IMAGES[7], // Goku
    tags: [SEED_TAGS[10], SEED_TAGS[11]],
  },
  {
    title: 'Vegetta777 is childhood',
    content:
      'Waking up to watch Planeta Vegetta or Karmaland. He has been consistent for over a decade. A legend of Hispanic YouTube. #vegueta777  #youtube',
    imageIndex: SEED_IMAGES[8], // Vegetta
    tags: [SEED_TAGS[12], SEED_TAGS[13]],
  },
  {
    title: 'Kame Hame Ha!',
    content:
      "Dragon Ball Super brought back the hype. The Tournament of Power arc was peak anime. Can't wait for the new series. #goku",
    imageIndex: null,
    tags: [SEED_TAGS[10]], // CORREGIDO: Tenías el tag de Coldplay [7], cambiado a Goku [10]
  },
  {
    title: 'Karmaland memories',
    content:
      'The interactions between Vegetta, Willy, and Rubius were golden content. The best Minecraft series ever made. #vegueta777 #minecraft',
    imageIndex: SEED_IMAGES[9], // Karmaland
    tags: [SEED_TAGS[12], SEED_TAGS[14]],
  },

  // --- SPORTS: TYSON ---
  {
    title: 'Prime Mike Tyson',
    content:
      'People only remember the ear bite, but prime Iron Mike was terrifying. His peek-a-boo style and head movement were art. #tyson #boxing',
    imageIndex: SEED_IMAGES[10], // Tyson
    tags: [SEED_TAGS[15], SEED_TAGS[16]],
  },

  // --- HISTORY: EGYPT ---
  {
    title: 'The Great Pyramid mystery',
    content:
      'It keeps me up at night thinking about how they moved those stones in ancient Egypt without modern technology. The precision is impossible. #egipto #history',
    imageIndex: SEED_IMAGES[11], // Egipto
    tags: [SEED_TAGS[17], SEED_TAGS[18]],
  },
];

const params = new URLSearchParams(window.location.search);
const rawId = params.get("id") || "01";
const id = /^\d{1,2}$/.test(rawId) ? String(Math.min(12, Math.max(1, Number(rawId)))).padStart(2, "0") : "01";

// Media filenames are kept in /images so they can be replaced independently later.
const eventMedia = {
  "01": { type: "video", src: "images/mathtune-scene.mp4", alt: "MathTune cinematic preview" },
  "02": { type: "video", src: "images/quiz-scene.mp4", alt: "Quiz cinematic preview" },
  "03": { type: "image", src: "images/marauders-map.gif", alt: "Marauder's Map animated preview" },
  "04": { type: "video", src: "images/murder-scene.mp4", alt: "Panic Room cinematic preview" },
  "10": { type: "video", src: "images/title-scene.mp4", alt: "INFINORA title cinematic preview" }
};

const events = {
  "01": {
    title: "EXPECTO MELODICA",
    subtitle: "Math Tune",
    intro: "Enter the enchanted music chamber, where melodies meet mathematical mysteries. Let rhythm, logic and numerical harmony weave a spell that transforms mathematics into an extraordinary symphony.",
    about: "Songs inspired by the theme INFINORA - Infinite Aura are highly encouraged. Participants are encouraged to bring and use their own musical instruments.",
    eligibility: "Only one team per shift per college is permitted. Each team must have a minimum of 4 and a maximum of 6 members.",
    rules: ["Only one team per shift per college is permitted, with a minimum of 4 and a maximum of 6 members per team.",
    "Karaoke is strictly prohibited. Participants are encouraged to bring and use their own musical instruments.",
    "Each team will be given 1 minute of preparation time on stage.",
    "The performance duration must be between 2 and 3 minutes. Exceeding the time limit will result in a deduction of points.",
    "Songs inspired by the theme INFINORA - Infinite Aura are highly encouraged.",
    "Lyrics must be appropriate and free from any form of vulgarity or offensive content.",
    "Participants must report to the venue 15 minutes prior to their scheduled performance.",
    "Any form of misconduct or violation of the rules will lead to disqualification.",
    "The judges' decision will be final and binding."],
    preserveExisting: true
  },
  "02": {
    title: "SNAPE'S INQUISITION",
    subtitle: "Quiz",
    intro: "Beyond the doors of the ancient chamber lies a collection of enchanted questions. Only those with sharp logic, brilliant reasoning and the wisdom to unlock mathematical secrets shall emerge victorious.",
    about: "A quiz event built around basic mathematical concepts, critical thinking and logical reasoning. Prelims will be conducted depending on the number of participants. The top four qualifying teams will advance to the finals, which consist of three rounds. The final-round rules will be disclosed on the spot.",
    eligibility: "Each team must consist of 2 members. Each college may register only one team.",
    rules: [
      "Prelims will be conducted according to the number of participants.",
      "The event is based on basic mathematical concepts, critical thinking and logical reasoning.",
      "The top four qualifying teams from the prelims will move on to the finals.",
      "The finals consist of 3 rounds in total; rules will be disclosed on the spot.",
      "The winner will be decided based on the total points scored by each team in the finals."
    ]
  },
  "03": {
    title: "MATHNOVA",
    subtitle: "Paper Presentation",
    intro: "Welcome to the realm of mathematical discoveries, where extraordinary minds reveal theories, uncover hidden patterns and present the mysteries of the mathematical universe. Let your knowledge become the next great magical revelation.",
    about: "Participants may present a paper on any mathematical concept or topic related to Mathematics and its applications.",
    eligibility: "Individual participation. The supplied rules do not specify a team format.",
    rules: [
      "Submit the PowerPoint presentation (PPT) to the event email address before 3 December 2026. The email address is yet to be provided.",
      "Each participant will be given 7 minutes for the presentation, followed by 2 minutes for the Question and Answer (Q&A) session.",
      "The presentation must be prepared in PowerPoint format.",
      "Content must be authentic, informative and mathematically accurate. Include proper references wherever necessary.",
      "Participants must strictly adhere to the allotted time limit.",
      "Judging will be based on subject knowledge, mathematical accuracy, originality, presentation skills and the ability to answer questions.",
      "The judges' decision will be final and binding."
    ]
  },
  "04": {
    title: "VANISH VAULT",
    subtitle: "Murder Mustery",
    intro: "A mysterious chamber holds secrets waiting to be uncovered. Decode hidden clues, solve enchanted mathematical puzzles and follow the trail of evidence. Only the sharpest minds can escape the mystery before time runs out.",
    about: "This team event comprises two rounds. Round 1 is a mathematical reasoning test. Shortlisted teams advance to Round 2, the Murder Mystery.",
    eligibility: "Each team must consist of 3 participants. A maximum of one team per shift, per department is allowed.",
    rules: [
      "Participants must be present at the venue at least 15 minutes before the scheduled time.",
      "Round 1: Mathematical reasoning test on problem-solving skills and maths-related knowledge.",
      "Round 2: Shortlisted teams will advance to the Murder Mystery.",
      "Electronic devices, including mobile phones, calculators and smartwatches, are strictly prohibited.",
      "Any form of vulgarity or malpractice will lead to immediate disqualification.",
      "Only clues given inside the room should be used to solve tasks.",
      "The Crew's decisions will be final and binding."
    ]
  },
  "05": {
    title: "ADZARDRY",
    subtitle: "Adzap",
    intro: "Prepare to unleash your creative spells! Transform ordinary products into extraordinary magical creations using mathematical expressions, imagination and theatrical brilliance. Your advertisement could become the next sensation in the wizarding marketplace.",
    about: "Teams create and enact an advertisement for a product allotted to them on the spot.",
    eligibility: "Each team must consist of a minimum of 5 and a maximum of 6 participants, per shift, per college.",
    rules: [
      "Teams must create and enact an advertisement for the product allotted to them on the spot.",
      "The use of props, properties or any external materials is strictly prohibited.",
      "The use of mathematical terminology is mandatory.",
      "Every advertisement must include a brand name and a tagline.",
      "Participants may use English and/or Tamil during their performance.",
      "Vulgar language, inappropriate gestures or offensive actions will lead to immediate disqualification.",
      "The judges' decision will be final and binding.",
      "Preparation time: 2 minutes. Performance time: 5 minutes."
    ]
  },
  "06": {
    title: " MATH-0-MANIA",
    subtitle: "Shipwreak",
    intro: "The ship is sinking, and only the most convincing wizard can survive! Step into a battle of wit, humour and imagination. Use mathematical magic, powerful arguments and creative reasoning to prove why you deserve a place on the last lifeboat.",
    about: "Participants battle against each other through a character-based performance. Prelims will be conducted if necessary, and the top 6 participants will advance to the second round.",
    eligibility: "Individual event. A maximum of one participant per shift per college is allowed.",
    rules: [
      "Vulgarity of any form will lead to immediate disqualification.",
      "Judging will be based on creativity, humour, usage of mathematical terms and involvement of the given character.",
      "Each participant will be given a total of 5 minutes: 4 minutes for the battle and 1 minute for preparation.",
      "Prelims will be conducted if necessary.",
      "The top 6 participants will make it to the second round."
    ],
    organizer: "Boffin – 7339241948"
  },
  "07": {
    title: "THE GOBLET SNITCH OF GEOMENTR",
    subtitle: "Face painting",
    intro: "Enter the magical art chamber, where faces become enchanted canvases. Transform mathematical symbols, geometric patterns and mystical ideas into extraordinary works of art. Let every brushstroke reveal a little mathematical magic.",
    about: "An on-the-spot face-painting event for UG students. The topic will be given on the spot.",
    eligibility: "Open to all UG students. Team of 2: 1 Artist + 1 Model. The model should not paint.",
    rules: [
      "No pre-drawn design is allowed.",
      "Total time: 60 minutes – 10 minutes planning, 45 minutes painting and 5 minutes finishing.",
      "Bring your own art materials.",
      "Paint only on the face and neck; keep eyes closed.",
      "Phones, copying, stencils, banned materials, late finishing and vulgar designs will lead to disqualification.",
      "Report 30 minutes prior and keep the area clean."
    ],
    organizer: "Vijayakumar V – 6380701404"
  },
  "08": {
    title: "THE GOBLET OF GEOMENTRIC MAGIC",
    subtitle: "Math Rangoli",
    intro: "Discover the hidden magic of symmetry, geometry and mathematical patterns. Create enchanting designs inspired by the wizarding world, where every curve, angle and colour contributes to a masterpiece of mathematical artistry.",
    about: "Teams create a mathematical rangoli and explain the mathematical concepts used in their design.",
    eligibility: "Each team must consist of 3 members. One member creates the outline, while the other two may assist with colouring.",
    rules: [
      "The design must incorporate mathematical concepts, formulas, patterns or geometrical shapes.",
      "Teams must explain the mathematical concepts used in their design.",
      "Mobile phones and electronic devices are strictly prohibited during the event.",
      "Participants must bring their own materials.",
      "The judges' decision is final."
    ],
    organizer: "Sharon Mariya – 7604953584"
  },
  "09": {
    title: "THE GOBLET OF GALLEONS",
    subtitle: "Math Bid",
    intro: "Enter the grand wizarding auction, where knowledge is currency and strategy is your greatest spell. Bid for brilliant minds, compete for mysterious questions and negotiate your way through mathematical challenges. Only the wisest strategists will claim the ultimate treasure.",
    about: "The event has three rounds: Scientist Bid, Questions Bid and Box Negotiation. Teams use bidding, negotiation and strategic decision-making to progress through the game.",
    eligibility: "Each team must consist of exactly 3 participants. A maximum of one team per college/department is allowed. Students registering for The Kingdom of Arithmos must not register for any other events.",
    rules: [
      "Round 1 – Scientist Bid: Teams participate in the Scientist Bidding round and must follow the official bidding instructions. Bidding decisions and outcomes influence game progress.",
      "Round 2 – Questions Bid: Questions will be introduced for bidding. Teams must use their strategies while participating in the bidding process.",
      "Round 3 – Box Negotiation: Teams participate in the final Box Negotiation round. Kingdoms must use negotiation and strategic decision-making. Final outcomes will be evaluated according to the game rules.",
      "The game starts at exactly 10:30 AM. Participants arriving or joining after the game starts will NOT be permitted to participate.",
      "Mobile phones, smartwatches, calculators and other digital devices are strictly prohibited.",
      "Participants must follow the instructions given by the organisers.",
      "Any unfair practices or violations of the rules may result in disqualification.",
      "All decisions made by the organisers and judges are final and binding."
    ],
    organizer: "Vignesh – 6382371578",
    time: "11:30 AM",
    venue: "JF",
    note: "  "
  },
  "10": {
    title: "MR./MS. INFINORA’26 – TITLE EVENT",
    subtitle: "Title Event",
    intro: "The most prestigious magical honour awaits! Chosen representatives from the winning and runner-up teams of the three designated challenges will enter the ultimate competition. Showcase your confidence, intelligence and personality to claim the legendary title of Mr./Ms. INFINORA ’26.",
    about: "One participant from each of the Winner and Runner-up teams of the flagged events (ADZAP, SHIPWRECK and QUIZ) is eligible to participate in the MR./MS. INFINORA’26 Title Event.",
    eligibility: "The respective teams must nominate one representative. Each team can nominate only one participant, and the nominated participant must be a member of the respective winning or runner-up team. No direct registrations will be accepted. Qualification: 3 flagged events × 2 teams × 1 representative = 6 participants.",
    rules: [
      "Flagged Events: ADZAP • SHIPWRECK • QUIZ.",
      "The respective teams must nominate one representative to compete in the Title Event.",
      "Each team can nominate only one participant.",
      "The nominated participant must be a member of the respective winning or runner-up team.",
      "No direct registrations will be accepted for the Title Event.",
      "The organising committee's decision regarding eligibility will be final."
    ],
    organizer: "Martin – 9344725124",
    time: "2:00 PM"
  },
  "11": {
    title: " INK AND INCANTATION",
    subtitle: " Poster Making ",
    intro: "Every great spell begins with imagination. Bring together the magic of mathematics and the artistry of the wizarding world. Turn equations into enchantments and mathematical concepts into extraordinary handmade masterpieces.",
    about: "An online poster-making event. Participants must creatively incorporate mathematical concepts into the Harry Potter theme.",
    eligibility: "Individual online event. Team-size or college limits were not specified in the supplied rules.",
    rules: [
      "Posters must follow the theme Harry Potter × Mathematics.",
      "Only handmade posters are allowed; digital designs are not permitted.",
      "Mathematical concepts must be creatively incorporated into the theme.",
      "Creativity, originality and neatness will be considered during judging.",
      "Participants must submit a scanned copy of their handmade poster through the designated online submission platform before the deadline."
    ],
    organizer: "Juana Sharon A – 9840279609"
  },
  "12": {
    title: "FRAMORA",
    subtitle: "Reel Making",
    intro: "Step into the Pensieve and bring extraordinary moments back to life! Recreate legendary historical events, scientific discoveries and remarkable inventions through the magic of storytelling, acting and visual imagination. Let your creation become a memory worth preserving.",
    about: "An online reel-making event. The reel must recreate a famous historical event, scientific discovery, invention or significant incident through acting and visual storytelling rather than simply explaining it.",
    eligibility: "Online event. The supplied rules do not specify a team-size limit.",
    rules: [
      "The reel must be 30–60 seconds long.",
      "The video must recreate a famous historical event, scientific discovery, invention or significant incident.",
      "Participants must portray the event through acting and visual storytelling rather than just explaining it.",
      "Creativity, originality and editing skills are encouraged.",
      "The content must be appropriate and informative, and submitted within the given deadline."
    ],
    organizer: "Fayas Ahmed – 9042457528"
  }
};

const eventData = events[id] || events["01"];
document.getElementById("eventNumber").textContent = `EVENT ${id}`;
document.getElementById("eventTitle").textContent = eventData.title;
document.getElementById("eventSubtitle").textContent = eventData.subtitle || "";
document.getElementById("eventIntro").textContent = eventData.intro || "";
document.title = `${eventData.title} | INFINORA`;
const register = document.querySelector(".register-cta");
register.href = `register.html?event=${id}`;
if (id === "10") { register.hidden = true; }

// Show only actual supplied media. No emblem, logo, star ornament or empty placeholder.
const art = document.getElementById("detailArt");
const media = eventMedia[id];
if (media) {
  if (media.type === "video") {
    const video = document.createElement("video");
    video.src = media.src;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", media.alt);
    art.appendChild(video);
    video.play().catch(() => { video.controls = true; });
  } else {
    const image = document.createElement("img");
    image.src = media.src;
    image.alt = media.alt;
    art.appendChild(image);
  }
}

const panels = document.getElementById("detailPanels");
panels.innerHTML = "";
function addPanel(title, content, list = false, wide = false) {
  const article = document.createElement("article"); article.className = wide ? "info-panel wide" : "info-panel";
  const heading = document.createElement("h2"); heading.textContent = title; article.appendChild(heading);
  if (list) {
    const ul = document.createElement("ul");
    content.forEach(item => { const li = document.createElement("li"); li.textContent = item; ul.appendChild(li); });
    article.appendChild(ul);
  } else {
    const p = document.createElement("p"); p.textContent = content; article.appendChild(p);
  }
  panels.appendChild(article);
}
addPanel("ABOUT THE EVENT", eventData.about || "Details will be announced soon.");
addPanel("ELIGIBILITY", eventData.eligibility || "To Be Announced.");
addPanel("RULES & GUIDELINES", eventData.rules || ["To Be Announced."], true, true);

// The INFO panel is written directly in event.html as a static fallback (all TBA).
// Fill in only the values we actually have; anything missing stays "TBA".
const infoCells = {};
document.querySelectorAll(".event-info-row").forEach(row => {
  const label = row.querySelector("dt"), value = row.querySelector("dd");
  if (label && value) infoCells[label.textContent.trim()] = value;
});
function fillInfo(label, text, href, external) {
  const cell = infoCells[label];
  if (!cell || !text) return;
  cell.textContent = "";
  if (!href) { cell.textContent = text; return; }
  const link = document.createElement("a");
  link.href = href; link.textContent = text;
  if (external) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
  cell.appendChild(link);
}
fillInfo("Timing", eventData.time);
fillInfo("Venues", eventData.venue);
// organizer is written as "Name – 1234567890"
const organizerMatch = /^(.*?)\s*[–-]\s*(\+?[\d\s]{10,})$/.exec(eventData.organizer || "");
if (organizerMatch) {
  const phone = organizerMatch[2].replace(/\D/g, "");
  fillInfo("Organizer name", organizerMatch[1].trim());
  fillInfo("Mobile number", phone, `tel:+91${phone.slice(-10)}`);
}
if (eventData.note) addPanel("IMPORTANT NOTE", eventData.note, false, true);

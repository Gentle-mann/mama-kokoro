-- Sample community posts for ByteFriend with Japanese vocabulary
-- These posts will be inserted into the tips table

INSERT INTO tips (title, content, summary, category, visual_url, user_id) VALUES 
(
  'Setting Up Your First Apartment in Japan',
  'Moving into your first Japanese apartment can be overwhelming, but here''s what helped me! First, you''ll need to set up utilities - gas (ガス), electricity (電気), and water (水道). Don''t forget to register your address at the city hall within 14 days. For furniture, check out Nitori or IKEA for affordable options. Pro tip: Many apartments don''t come with lighting fixtures, so budget for ceiling lights! The tatami mats might feel strange at first, but they''re actually quite comfortable once you get used to them.',
  'Essential guide for setting up your first apartment in Japan, including utilities, furniture, and registration requirements.',
  'living',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20apartment%20interior%20setup%20with%20tatami%20mats%20and%20modern%20furniture&image_size=landscape_4_3',
  (SELECT id FROM users LIMIT 1)
),
(
  'Getting a SIM Card and Phone Plan as a Foreigner',
  'Getting connected in Japan is easier than you think! I recommend going to a major carrier like SoftBank, au, or docomo. You''ll need your residence card (在留カード) and passport. If you''re staying short-term, consider prepaid options or MVNOs like Rakuten Mobile. Don''t be intimidated by the paperwork - most staff at major stores speak some English. The process usually takes 1-2 hours, so bring something to read! Also, many plans include unlimited data for social media apps, which is super convenient.',
  'Step-by-step guide to getting a mobile phone plan in Japan as a foreigner, including required documents and carrier recommendations.',
  'mobile',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20mobile%20phone%20store%20with%20staff%20helping%20foreign%20customer&image_size=landscape_4_3',
  (SELECT id FROM users LIMIT 1)
),
(
  'Opening a Bank Account: Japan Post Bank Made Easy',
  'Japan Post Bank (ゆうちょ銀行) is definitely the most foreigner-friendly option! I walked in with just my residence card and passport, and the staff was incredibly patient. They have English forms available, and the process took about 45 minutes. You''ll also need a hanko (印鑑) - you can get a simple one made at any 100-yen shop for around 500 yen. The account comes with a cash card that works at most ATMs, including 7-Eleven. Pro tip: Download their app for easy balance checking, though it''s only in Japanese.',
  'Complete guide to opening a bank account at Japan Post Bank, including required documents and the hanko seal process.',
  'banking',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japan%20Post%20Bank%20branch%20interior%20with%20helpful%20staff%20and%20English%20forms&image_size=landscape_4_3',
  (SELECT id FROM users LIMIT 1)
),
(
  'City Hall Survival Guide: Address Registration and More',
  'Your first trip to city hall (市役所) doesn''t have to be scary! Go early in the morning (before 10 AM) to avoid crowds. For address registration (住所変更), bring your residence card, passport, and the moving notification form. The staff will help you fill out the resident registration (住民票). While you''re there, you can also apply for the My Number card if you haven''t already. Most city halls have English-speaking staff or translation services. The whole process usually takes 30-45 minutes if you have all your documents ready.',
  'Essential guide to navigating Japanese city hall procedures, including address registration and document requirements.',
  'city-hall',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20city%20hall%20entrance%20with%20clear%20signage%20and%20people%20waiting%20in%20organized%20lines&image_size=landscape_4_3',
  (SELECT id FROM users LIMIT 1)
),
(
  'Daily Japanese Practice: Small Steps, Big Progress',
  'Learning Japanese doesn''t have to be overwhelming! I started with just 15 minutes a day using apps like Duolingo, but the real progress came from daily interactions. Try ordering coffee in Japanese - start with "コーヒーをお願いします" (koohii wo onegaishimasu). Convenience store staff are usually very patient with beginners. I also recommend watching Japanese YouTube channels with subtitles and gradually reducing your reliance on them. Don''t be afraid to make mistakes - most Japanese people appreciate the effort and will help you improve!',
  'Practical tips for daily Japanese language practice, including useful phrases and learning strategies for beginners.',
  'language',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Person%20studying%20Japanese%20with%20books%20and%20phone%20app%20in%20cozy%20setting&image_size=landscape_4_3',
  (SELECT id FROM users LIMIT 1)
),
(
  'Bowing, Business Cards, and Workplace Etiquette',
  'Japanese workplace culture has some unique aspects, but don''t stress too much! Bowing (お辞儀) is important - a slight bow when greeting is perfect for most situations. When exchanging business cards (名刺), receive them with both hands and take a moment to read them before putting them away respectfully. Always be on time (actually, arrive 5-10 minutes early). The concept of "reading the air" (空気を読む) means being aware of the group mood. When in doubt, observe what others do and follow their lead. Most colleagues are understanding that you''re learning the culture!',
  'Essential guide to Japanese workplace etiquette, including bowing, business card exchange, and cultural awareness tips.',
  'culture',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20office%20environment%20with%20people%20bowing%20and%20exchanging%20business%20cards&image_size=landscape_4_3',
  (SELECT id FROM users LIMIT 1)
);
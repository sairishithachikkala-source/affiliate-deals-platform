const fs = require('fs');
const path = require('path');

const newTranslations = {
  en: {
    wishlist_login_prompt_title: "Sign In Required",
    wishlist_login_prompt: "Please sign in to save products to your wishlist.",
    sign_in: "Sign In",
    create_account: "Create Account",
    wishlist_save_success: "Product saved to your wishlist!",
    explore_label: "Explore",
    continue_browsing: "Continue Browsing"
  },
  te: {
    wishlist_login_prompt_title: "సైన్ ఇన్ అవసరం",
    wishlist_login_prompt: "మీ కోరికల జాబితాలో ఉత్పత్తులను సేవ్ చేయడానికి దయచేసి సైన్ ఇన్ చేయండి.",
    sign_in: "సైన్ ఇన్",
    create_account: "ఖాతాను సృష్టించండి",
    wishlist_save_success: "ఉత్పత్తి మీ కోరికల జాబితాలో సేవ్ చేయబడింది!",
    explore_label: "అన్వేషించండి",
    continue_browsing: "బ్రౌజింగ్ కొనసాగించండి"
  },
  hi: {
    wishlist_login_prompt_title: "साइन इन आवश्यक है",
    wishlist_login_prompt: "अपनी विशलिस्ट में उत्पादों को सहेजने के लिए कृपया साइन इन करें।",
    sign_in: "साइन इन करें",
    create_account: "खाता बनाएं",
    wishlist_save_success: "उत्पाद आपकी विशलिस्ट में सहेज लिया गया है!",
    explore_label: "एक्सप्लोर करें",
    continue_browsing: "ब्राउज़ करना जारी रखें"
  },
  ta: {
    wishlist_login_prompt_title: "உள்நுழைவு தேவை",
    wishlist_login_prompt: "உங்கள் விருப்பப்பட்டியலில் தயாரிப்புகளைச் சேமிக்க தயவுசெய்து உள்நுழையவும்.",
    sign_in: "உள்நுழைக",
    create_account: "கணக்கை உருவாக்கவும்",
    wishlist_save_success: "தயாரிப்பு உங்கள் விருப்பப்பட்டியலில் சேமிக்கப்பட்டது!",
    explore_label: "ஆராயுங்கள்",
    continue_browsing: "உலவுவதைத் தொடரவும்"
  },
  ml: {
    wishlist_login_prompt_title: "സൈൻ ഇൻ ആവശ്യമാണ്",
    wishlist_login_prompt: "നിങ്ങളുടെ വിഷ്‌ലിസ്റ്റിൽ ഉൽപ്പന്നങ്ങൾ സംരക്ഷിക്കാൻ ദയവായി സൈൻ ഇൻ ചെയ്യുക.",
    sign_in: "സൈൻ ഇൻ ചെയ്യുക",
    create_account: "അക്കൗണ്ട് സൃഷ്ടിക്കുക",
    wishlist_save_success: "ഉൽപ്പന്നം നിങ്ങളുടെ വിഷ്‌ലിസ്റ്റിൽ സംരക്ഷിച്ചു!",
    explore_label: "പരിശോധിക്കുക",
    continue_browsing: "ബ്രൗസിംഗ് തുടരുക"
  },
  kn: {
    wishlist_login_prompt_title: "ಸೈನ್ ಇನ್ ಅಗತ್ಯವಿದೆ",
    wishlist_login_prompt: "ನಿಮ್ಮ ಇಷ್ಟಪಟ್ಟ ಪಟ್ಟಿಯಲ್ಲಿ ಉತ್ಪನ್ನಗಳನ್ನು ಉಳಿಸಲು ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.",
    sign_in: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
    create_account: "ಖಾತೆ ರಚಿಸಿ",
    wishlist_save_success: "ಉತ್ಪನ್ನವನ್ನು ನಿಮ್ಮ ಇಷ್ಟಪಟ್ಟ ಪಟ್ಟಿಯಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ!",
    explore_label: "ಅನ್ವೇಷಿಸಿ",
    continue_browsing: "ಬ್ರೌಸಿಂಗ್ ಮುಂದುವರಿಸಿ"
  },
  mr: {
    wishlist_login_prompt_title: "साइन इन आवश्यक आहे",
    wishlist_login_prompt: "तुमच्या विशलिस्टमध्ये उत्पादने सेव्ह करण्यासाठी कृपया साइन इन करा.",
    sign_in: "साइन इन करा",
    create_account: "खाते तयार करा",
    wishlist_save_success: "उत्पादन तुमच्या विशलिस्टमध्ये सेव्ह केले आहे!",
    explore_label: "एक्सप्लोर करा",
    continue_browsing: "ब्राउझिंग सुरू ठेवा"
  },
  bn: {
    wishlist_login_prompt_title: "সাইন ইন প্রয়োজন",
    wishlist_login_prompt: "আপনার পছন্দের তালিকায় পণ্য সংরক্ষণ করতে অনুগ্রহ করে সাইন ইন করুন।",
    sign_in: "সাইন ইন করুন",
    create_account: "অ্যাকাউন্ট তৈরি করুন",
    wishlist_save_success: "পণ্যটি আপনার পছন্দের তালিকায় সংরক্ষিত হয়েছে!",
    explore_label: "ঘুরে দেখুন",
    continue_browsing: "ব্রাউজ করা চালিয়ে যান"
  }
};

const languages = ['en', 'te', 'hi', 'ta', 'ml', 'kn', 'mr', 'bn'];
const translationsDir = path.resolve(__dirname, '../src/i18n/translations');

// Obsolete keys to ensure removed from all translation files
const obsoleteKeys = [
  'subcat_men_wear',
  'subcat_women_wear',
  'subcat_laptop_audio',
  'subcat_smartwatches',
  'subcat_fragrances'
];

languages.forEach(lang => {
  const filePath = path.join(translationsDir, `${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Remove obsolete keys
  obsoleteKeys.forEach(k => {
    delete content[k];
  });

  // Add new translations
  const langAdditions = newTranslations[lang] || {};
  Object.keys(langAdditions).forEach(key => {
    content[key] = langAdditions[key];
  });

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log(`Updated ${lang}.json - Total keys: ${Object.keys(content).length}`);
});

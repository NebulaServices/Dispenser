const API = 'https://archive.lightspeedsystems.com/SubmitDomain.php?Domain=';

const categories = ["G-Rated","PG-Rated", "R-Rated", "S-Rated", "X-Rated", "access-denied", "ads", "alcohol","analytics.computers", "animals.kids_and_teens", "art.mature","arts.education", "auctions.shopping", "audio-video","automobile", "banner-ads.ads", "blogs.forums","bodyart.mature", "business", "chat.kids_and_teens","cn.world", "construction.business", "consumer_electronics.computers", "crime.society", "dating.forums","de.porn", "de.world", "directory","drugs", "education", "entertainment","errors", "es.porn", "es.world","esports", "expired", "extremism.violence", "facebook", "family", "fantasy.sports","filehosting.computers", "finance.business", "food.family","forums", "fr.porn", "fr.world","gambling", "games", "games.mature","hacking.security", "hate.violence", "health.family",  "history.education", "hobby", "html-ads.ads", "humor","illicit.porn", "im.forums", "instagram","it.porn", "it.world", "javascript-ads.ads","jobs.business", "jp.porn", "jp.world","kids_and_teens", "kr.world", "language.mature", "law", "lifestyles.education", "lifestyles.mature","literature.education", "local-block", "mail.forums","malware.security", "manufacturing.business", "martial_arts.sports","mature", "media.education", "microsoft","music", "music.education", "nettools.security",  "news", "newsgroups.forums", "nl.porn", "nl.world","offensive", "office_supplies.shopping", "p2p.forums","parked", "personals.forums", "phishing.security","photography", "pinterest", "pl.porn","pl.world", "plagiarism", "politics.society", "popup-ads.ads", "porn", "potentially_unwanted_applications.security","proxy.security", "pt.porn", "pt.world","radio_and_tv.entertainment", "real_estate.business", "religion.family","ru.porn", "ru.world", "science.education","script.suspicious", "search", "security", "sex.education",  "shopping", "shorteners.security", "social_networking.forums", "social_science.education","society", "spam", "spam.shopping","sports", "spyware.security", "storage.computers","suspicious", "test.security", "translators.security","travel", "twitter", "videos.education", "violence", "virus.security", "virus_ignore.security","warez.security", "weapons", "world","youth.sports", "security.proxy"];

const fetch = require('cross-fetch');
const { JSDOM } = require('jsdom');

async function blocked(domain) {
  const response = await fetch(API + domain);
  
  const body = await response.text();
  
  const dom = new JSDOM(body);

  const link = dom.window.document.getElementsByClassName('button button--blue m-right--8')[0];

  const category = link.textContent;

  console.log(category);
  
  return categories.includes(category);
}

module.exports = { blocked };
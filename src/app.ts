import './global.css';
import '../public/assets/css/chatui-theme.css';
import'../public/assets/js/chatui.js'




var script = document.createElement('script');
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-N30RF8EDRR';
script.async = true;
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-N30RF8EDRR');


// db.project.put({
//   nanoid: activeProjectID,
// });

// db.bot.put({
//   nanoid: activeProjectID,
// });

// history.replace('editor');

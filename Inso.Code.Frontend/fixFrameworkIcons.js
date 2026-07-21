const fs = require('fs');

const iconMap = {
  "Qwik": "logos:qwik",
  "Preact": "logos:preact",
  "Alpine.js": "logos:alpinejs-icon",
  "Lit": "logos:lit-icon",
  "Ember.js": "logos:ember",
  "Backbone.js": "logos:backbone-icon",
  "Aurelia": "logos:aurelia",
  "Meteor": "logos:meteor-icon",
  "Express": "logos:express",
  "Koa": "logos:koa",
  "Hapi": "logos:hapi",
  "Sails": "logos:sails",
  "AdonisJS": "logos:adonisjs-icon",
  "Deno Fresh": "logos:deno",
  "Ruby on Rails": "logos:rails",
  "Sinatra": "logos:sinatra",
  "Hanami": "logos:hanami",
  "Flask": "logos:flask",
  "Tornado": "logos:python",
  "Bottle": "logos:python",
  "Falcon": "logos:python",
  "Gin": "logos:go",
  "Echo": "logos:go",
  "Fiber": "logos:go",
  "Revel": "logos:go",
  "Beego": "logos:go",
  "Phoenix": "logos:phoenix",
  "Spring": "logos:spring-icon",
  "Play": "logos:play",
  "Struts": "logos:java",
  "ASP.NET Core": "logos:dotnet",
  "React Native": "logos:react",
  "Flutter": "logos:flutter",
  "Ionic": "logos:ionic-icon",
  "Cordova": "logos:cordova",
  "Capacitor": "logos:capacitor",
  "NativeScript": "logos:nativescript",
  "Xamarin": "logos:xamarin",
  "Tailwind CSS": "logos:tailwindcss-icon",
  "Bootstrap": "logos:bootstrap",
  "Bulma": "logos:bulma",
  "Foundation": "logos:foundation",
  "Material-UI": "logos:material-ui",
  "Chakra UI": "logos:chakra-ui",
  "Ant Design": "logos:ant-design",
  "Semantic UI": "logos:semantic-ui",
  "Vuetify": "logos:vuetifyjs",
  "TensorFlow": "logos:tensorflow",
  "Keras": "logos:keras",
  "Scikit-learn": "logos:scikit-learn",
  "Pandas": "logos:pandas-icon",
  "NumPy": "logos:numpy",
  "OpenCV": "logos:opencv",
  "Apache Spark": "logos:apache-spark",
  "Hadoop": "logos:hadoop",
  "Unreal Engine": "logos:unrealengine",
  "Godot": "logos:godot-icon",
  "Phaser": "logos:phaser"
};

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

for (const [name, icon] of Object.entries(iconMap)) {
  const nameStr = `name: "${name} Specialist AI"`;
  
  let startIndex = 0;
  while (true) {
    const nameIdx = content.indexOf(nameStr, startIndex);
    if (nameIdx === -1) break;
    
    // Find the next 'icon: "lucide:layers"' (or generic box/frame icon) after this name
    // Actually, in the frontend, frameworks currently have either "solar:box-linear", "lucide:layers", etc.
    // Let's just find `icon: ` and replace the value up to the end of the line
    const iconIdx = content.indexOf('icon: ', nameIdx);
    const objEndIdx = content.indexOf('},', nameIdx);
    
    if (iconIdx !== -1 && iconIdx < objEndIdx) {
      const lineEndIdx = content.indexOf('\n', iconIdx);
      const before = content.substring(0, iconIdx);
      const after = content.substring(lineEndIdx);
      content = before + `icon: "${icon}",` + after;
    }
    
    startIndex = nameIdx + nameStr.length;
  }
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Updated framework icons");

const classes = require('../data/classes.js');

function recruit(content) {
  return new Promise((resolve, reject) => {
    let regex = new RegExp(/^recruit\s(\w+)\s(\w+)\s(\w+)/, 'g');
    let commands = regex.exec(content.toLowerCase());
    let classArr = Object.keys(classes).filter((key) => key.includes(commands[2]));

    if (commands[1] == 'add') {
      if (classArr.length == 0) {
        resolve('Could not find any classes: ', commands[1]);
      }
      else {
        if (classArr.length > 1) {
          let spec;
          classArr.forEach(cls => {
            spec = Object.keys(classes[cls].specs).filter((key) => key.includes(commands[3]));
            if (spec.length == 1) {
              let arr = [];
              arr.push(cls, spec.toString(), classes[cls].specs[spec.toString()].type);
              resolve(arr);
              return;
            }
            else if (spec.length == 0){
              return;
            }
          });
        }
        else {
          let spec = Object.keys(classes[classArr.toString()].specs).filter((key) => key.includes(commands[3]));
          if (spec.length == 1) console.log(spec);
          else {
            resolve('did not find a spec.');
          }
        }
      }
    }
    else if (commands[1] == 'rem') {

    }
  });
}

module.exports = recruit;
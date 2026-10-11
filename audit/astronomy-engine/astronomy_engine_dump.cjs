// Uses the official standalone Astronomy Engine source downloaded by CI.
const fs = require("fs");
const Astronomy = require("./astronomy.js");
const dates = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const norm = x => ((x % 360) + 360) % 360;
const rad = Math.PI / 180;
function eclipticOfDate(vec, time) {
  const v = Astronomy.RotateVector(Astronomy.Rotation_EQJ_ECT(time), vec);
  return norm(Astronomy.SphereFromVector(v).lon);
}
function trueNode(time) {
  const T = time.tt / 36525;
  const D = 297.8501921 + 445267.1114034*T;
  const M = 357.5291092 + 35999.0502909*T;
  const Mp = 134.9633964 + 477198.8675055*T;
  const F = 93.272095 + 483202.0175233*T;
  const om = 125.0445479 - 1934.1362891*T;
  return norm(om - 1.4979*Math.sin(2*(D-F)*rad) - 0.15*Math.sin(M*rad)
    - 0.1226*Math.sin(2*D*rad) + 0.1176*Math.sin(2*F*rad)
    - 0.0801*Math.sin(2*(Mp-F)*rad));
}
const bodyMap = {
  Mercury: Astronomy.Body.Mercury, Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars, Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn, Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune, Pluto: Astronomy.Body.Pluto
};
function longitudes(iso) {
  const time = Astronomy.MakeTime(new Date(iso));
  const sun = norm(Astronomy.SunPosition(time).elon);
  const node = trueNode(time);
  const result = {Sun:sun, Earth:norm(sun+180), NorthNode:node,
    SouthNode:norm(node+180), Moon:eclipticOfDate(Astronomy.GeoMoon(time),time)};
  for (const [name, body] of Object.entries(bodyMap))
    result[name] = eclipticOfDate(Astronomy.GeoVector(body,time,true),time);
  return result;
}
console.log(JSON.stringify({source:"Astronomy Engine official standalone source",records:
  dates.map(timestamp=>({timestamp,longitudes:longitudes(timestamp)}))}));

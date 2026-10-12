#!/usr/bin/env python3
"""Compare Astronomy Engine with Swiss Ephemeris at the same UTC instants.

This is a diagnostic audit, not a declaration that either engine is canonical.
The included lunar-node formula is an approximation and is reported separately.
"""
import json, subprocess, sys
from datetime import datetime, timezone
import swisseph as swe

GATE_ORDER=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60]
OFFSET=58.0
BODIES={'Sun':swe.SUN,'Moon':swe.MOON,'Mercury':swe.MERCURY,'Venus':swe.VENUS,'Mars':swe.MARS,'Jupiter':swe.JUPITER,'Saturn':swe.SATURN,'Uranus':swe.URANUS,'Neptune':swe.NEPTUNE,'Pluto':swe.PLUTO,'NorthNode':swe.TRUE_NODE}
NODE_NAMES={'NorthNode','SouthNode'}
def jd(iso):
    d=datetime.fromisoformat(iso.replace('Z','+00:00')).astimezone(timezone.utc)
    return swe.julday(d.year,d.month,d.day,d.hour+d.minute/60+d.second/3600+d.microsecond/3.6e9)
def swiss_lon(iso,body):
    v,_=swe.calc_ut(jd(iso),BODIES[body])
    return float(v[0])%360
def gate_line(lon):
    p=((lon+OFFSET)%360)/360*64
    idx=min(63,int(p))
    return GATE_ORDER[idx],int((p*6)%6)+1
def delta(a,b): return abs((a-b+180)%360-180)
def stats(rows):
    if not rows: return {'samples':0,'gate_line_mismatches':0,'max_longitude_difference_deg':None,'mean_longitude_difference_deg':None}
    return {'samples':len(rows),'gate_line_mismatches':sum(not r['gate_line_match'] for r in rows),
      'max_longitude_difference_deg':max(r['absolute_difference_deg'] for r in rows),
      'mean_longitude_difference_deg':sum(r['absolute_difference_deg'] for r in rows)/len(rows)}
def main():
    date_path=sys.argv[1] if len(sys.argv)>1 else 'dates.json'
    run=subprocess.run(['node','astronomy_engine_dump.cjs',date_path],check=True,capture_output=True,text=True)
    payload=json.loads(run.stdout)
    rows=[]
    for rec in payload['records']:
        for body,ae in rec['longitudes'].items():
            if body=='Earth': sw=(swiss_lon(rec['timestamp'],'Sun')+180)%360
            elif body=='SouthNode': sw=(swiss_lon(rec['timestamp'],'NorthNode')+180)%360
            else: sw=swiss_lon(rec['timestamp'],body)
            ag,al=gate_line(ae); sg,sl=gate_line(sw)
            rows.append({'timestamp_utc':rec['timestamp'],'body':body,
              'astronomy_engine_longitude_deg':ae,'swiss_longitude_deg':sw,
              'absolute_difference_deg':delta(ae,sw),
              'astronomy_engine_gate_line':f'{ag}.{al}','swiss_gate_line':f'{sg}.{sl}',
              'gate_line_match':(ag,al)==(sg,sl)})
    core=[r for r in rows if r['body'] not in NODE_NAMES]
    nodes=[r for r in rows if r['body'] in NODE_NAMES]
    summary={'astronomy_engine_source':payload['source'],'swiss_ephemeris_version':swe.version,
      'timestamps_tested':len(payload['records']),'body_samples_total':len(rows),
      'core_planetary_and_derived_samples':stats(core),
      'lunar_node_samples_using_approximation':stats(nodes),
      'largest_core_differences':sorted(core,key=lambda r:r['absolute_difference_deg'],reverse=True)[:15],
      'largest_node_differences':sorted(nodes,key=lambda r:r['absolute_difference_deg'],reverse=True)[:6],
      'note':'Representative timestamps only. The node calculation uses a Meeus-style approximation and is not a like-for-like implementation of Swiss Ephemeris TRUE_NODE. Gate/line boundary tests remain necessary.'}
    out={'summary':summary,'samples':rows}
    with open('comparison-results.json','w') as f: json.dump(out,f,indent=2)
    print(json.dumps(summary,indent=2))
if __name__=='__main__': main()

#!/usr/bin/env python3
"""Cross-engine diagnostics plus exhaustive Human Design gate/line boundary checks."""
import json, subprocess, sys
from datetime import datetime, timezone
import swisseph as swe

GATE_ORDER=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60]
OFFSET=58.0
BODIES={'Sun':swe.SUN,'Moon':swe.MOON,'Mercury':swe.MERCURY,'Venus':swe.VENUS,'Mars':swe.MARS,'Jupiter':swe.JUPITER,'Saturn':swe.SATURN,'Uranus':swe.URANUS,'Neptune':swe.NEPTUNE,'Pluto':swe.PLUTO,'NorthNode':swe.TRUE_NODE}
NODE_NAMES={'NorthNode','SouthNode'}
SEGMENTS_PER_CIRCLE=64*6
def jd(iso):
    d=datetime.fromisoformat(iso.replace('Z','+00:00')).astimezone(timezone.utc)
    return swe.julday(d.year,d.month,d.day,d.hour+d.minute/60+d.second/3600+d.microsecond/3.6e9)
def swiss_lon(iso,body):
    v,_=swe.calc_ut(jd(iso),BODIES[body])
    return float(v[0])%360
def swiss_node_lon(iso, node_kind):
    flag = swe.TRUE_NODE if node_kind == 'true' else swe.MEAN_NODE
    v,_=swe.calc_ut(jd(iso),flag)
    return float(v[0])%360
def gate_line(lon):
    # Work in 384 equal segments and snap floating-point representations of exact
    # boundaries to the boundary itself. The boundary belongs to the next segment.
    q=((lon+OFFSET)%360)/360*SEGMENTS_PER_CIRCLE
    nearest=round(q)
    if abs(q-nearest) < 1e-9:
        q=float(nearest)
    idx=int(q) % SEGMENTS_PER_CIRCLE
    return GATE_ORDER[idx//6], idx%6+1
def delta(a,b): return abs((a-b+180)%360-180)
def stats(rows, match_key='gate_line_match'):
    if not rows: return {'samples':0,'gate_line_mismatches':0,'max_longitude_difference_deg':None,'mean_longitude_difference_deg':None}
    return {'samples':len(rows),'gate_line_mismatches':sum(not r[match_key] for r in rows),
      'max_longitude_difference_deg':max(r['absolute_difference_deg'] for r in rows),
      'mean_longitude_difference_deg':sum(r['absolute_difference_deg'] for r in rows)/len(rows)}
def boundary_self_test():
    # Check every gate/line boundary, both sides, and exact-boundary ownership.
    epsilon_deg=1e-7
    failures=[]
    for boundary in range(SEGMENTS_PER_CIRCLE):
        lon=((boundary/SEGMENTS_PER_CIRCLE*360)-OFFSET)%360
        expected_before=boundary-1
        expected_at=boundary
        expected_after=boundary
        def seg(x):
            gate,line=gate_line(x)
            return GATE_ORDER.index(gate)*6+(line-1)
        got_before=seg((lon-epsilon_deg)%360)
        got_at=seg(lon)
        got_after=seg((lon+epsilon_deg)%360)
        if (got_before,got_at,got_after)!=(expected_before%SEGMENTS_PER_CIRCLE,expected_at,expected_after):
            failures.append({'boundary_segment':boundary,'expected':[expected_before%SEGMENTS_PER_CIRCLE,expected_at,expected_after],
                             'actual':[got_before,got_at,got_after],'longitude_deg':lon})
    if failures:
        raise AssertionError(f"Gate/line boundary regression failures: {json.dumps(failures[:10])}; total={len(failures)}")
    return {'boundaries_tested':SEGMENTS_PER_CIRCLE,'side_and_exact_cases':SEGMENTS_PER_CIRCLE*3,
            'failures':0,'epsilon_degrees':epsilon_deg,
            'rule':'The exact boundary belongs to the next gate/line segment; wrap-around is tested.'}
def main():
    boundary_results=boundary_self_test()
    date_path=sys.argv[1] if len(sys.argv)>1 else 'dates.json'
    run=subprocess.run(['node','astronomy_engine_dump.cjs',date_path],check=True,capture_output=True,text=True)
    payload=json.loads(run.stdout)
    rows=[]
    for rec in payload['records']:
        for body,ae in rec['longitudes'].items():
            if body=='Earth': sw=(swiss_lon(rec['timestamp'],'Sun')+180)%360
            elif body=='SouthNode': sw=(swiss_node_lon(rec['timestamp'],'true')+180)%360
            else: sw=swiss_lon(rec['timestamp'],body)
            ag,al=gate_line(ae); sg,sl=gate_line(sw)
            row={'timestamp_utc':rec['timestamp'],'body':body,
              'astronomy_engine_longitude_deg':ae,'swiss_longitude_deg':sw,
              'absolute_difference_deg':delta(ae,sw),
              'astronomy_engine_gate_line':f'{ag}.{al}','swiss_gate_line':f'{sg}.{sl}',
              'gate_line_match':(ag,al)==(sg,sl)}
            if body in NODE_NAMES:
                node_kind='true'
                mean_sw=swiss_node_lon(rec['timestamp'],'mean')
                if body=='SouthNode': mean_sw=(mean_sw+180)%360
                row['swiss_mean_node_longitude_deg']=mean_sw
                row['difference_vs_swiss_mean_node_deg']=delta(ae,mean_sw)
                mg,ml=gate_line(mean_sw)
                row['swiss_mean_node_gate_line']=f'{mg}.{ml}'
                row['gate_line_match_vs_swiss_mean_node']=(ag,al)==(mg,ml)
            rows.append(row)
    core=[r for r in rows if r['body'] not in NODE_NAMES]
    nodes=[r for r in rows if r['body'] in NODE_NAMES]
    node_true_stats=stats(nodes)
    node_mean_rows=[{'absolute_difference_deg':r['difference_vs_swiss_mean_node_deg'],
                     'gate_line_match_vs_swiss_mean_node':r['gate_line_match_vs_swiss_mean_node']} for r in nodes]
    summary={'astronomy_engine_source':payload['source'],'swiss_ephemeris_version':swe.version,
      'timestamps_tested':len(payload['records']),'body_samples_total':len(rows),
      'boundary_self_test':boundary_results,
      'core_planetary_and_derived_samples':stats(core),
      'lunar_node_vs_swiss_true_node':node_true_stats,
      'lunar_node_vs_swiss_mean_node':{
        'samples':len(node_mean_rows),
        'gate_line_mismatches':sum(not r['gate_line_match_vs_swiss_mean_node'] for r in nodes),
        'max_longitude_difference_deg':max(r['difference_vs_swiss_mean_node_deg'] for r in nodes),
        'mean_longitude_difference_deg':sum(r['difference_vs_swiss_mean_node_deg'] for r in nodes)/len(nodes)},
      'largest_core_differences':sorted(core,key=lambda r:r['absolute_difference_deg'],reverse=True)[:15],
      'largest_node_differences_vs_true':sorted(nodes,key=lambda r:r['absolute_difference_deg'],reverse=True)[:6],
      'largest_node_differences_vs_mean':sorted(nodes,key=lambda r:r['difference_vs_swiss_mean_node_deg'],reverse=True)[:6],
      'note':'The custom Astronomy Engine node formula is compared separately with Swiss TRUE_NODE and MEAN_NODE. These are different node conventions; do not treat either comparison as proof of production equivalence. Representative dates are not a substitute for chart-specific validation.'}
    out={'summary':summary,'samples':rows}
    with open('comparison-results.json','w') as f: json.dump(out,f,indent=2)
    print(json.dumps(summary,indent=2))
if __name__=='__main__': main()

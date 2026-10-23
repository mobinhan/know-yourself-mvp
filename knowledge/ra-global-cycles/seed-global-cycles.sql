-- KY canonical knowledge seed: Ra Uru Hu, Global Cycles (Parts 1–5)
-- Paraphrase-only records; no verbatim lecture transcript is stored here.
-- Records remain staged/pending until human review; consumers must not retrieve them as validated canon.

begin;

insert into public.ky_knowledge_sources
  (id, title, source_url, source_tier, rights_status, review_cadence, status, metadata)
values
  ('ra-uru-hu-global-cycles-parts-1-5',
   'Ra Uru Hu — Global Cycles lecture series, Parts 1–5',
   null,
   'user_supplied',
   'paraphrase_only',
   'annual',
   'active',
   jsonb_build_object(
     'series', 'Global Cycles',
     'parts', jsonb_build_array(1,2,3,4,5),
     'capture_type', 'derived analysis from transcript discussion',
     'raw_transcript_stored', false,
     'source_locator_granularity', 'part-level only; timestamps/pages not available in this record',
     'rights_note', 'Store paraphrases and analytical summaries only unless reproduction rights are confirmed.',
     'review_note', 'Claims about future biology and Rave children are attributed to Ra’s model, not treated as established medical facts.'
   ))
on conflict (id) do update set
  title = excluded.title,
  source_url = excluded.source_url,
  source_tier = excluded.source_tier,
  rights_status = excluded.rights_status,
  review_cadence = excluded.review_cadence,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.ky_knowledge_records
  (id, source_id, record_type, concept_keys, claim, concise_paraphrase, provenance,
   validation_status, lifecycle_status, licensing_notes, version)
values
('gc-01-cross-of-planning-program','ra-uru-hu-global-cycles-parts-1-5','framework_claim',
 ARRAY['global_cycles','cross_of_planning','gates_37_40_9_16'],
 'In Ra Uru Hu’s Global Cycles framework, the Cross of Planning is associated with collective security, community, bargains, work, shared resources, and institutional support.',
 'Ra frames the Cross of Planning as a global organizing theme built around mutual bargains, family/community structures, shared resources, and collective security.',
 jsonb_build_object('part',1,'evidence_type','derived_paraphrase','locator','Part 1 summary','attribution','Ra Uru Hu framework'),
 'pending','staged','Paraphrase only; not a verbatim quotation.',1),

('gc-02-planning-gates','ra-uru-hu-global-cycles-parts-1-5','framework_claim',
 ARRAY['global_cycles','cross_of_planning','gate_37','gate_40','gate_9','gate_16'],
 'The Cross of Planning is represented in this lecture series through Gates 37, 40, 9, and 16.',
 'The four-gate configuration is presented as the energetic basis for the outgoing cycle’s themes of community, bargains, focus, and skills.',
 jsonb_build_object('part',1,'evidence_type','derived_paraphrase','locator','Part 1 summary','attribution','Ra Uru Hu framework'),
 'pending','staged','Paraphrase only; gate associations should be checked against the original lecture.',1),

('gc-03-sphinx-and-keys','ra-uru-hu-global-cycles-parts-1-5','concept_mapping',
 ARRAY['sphinx','gate_13','gate_7','gate_1','gate_2','gate_61','gate_62','gate_32','gate_42'],
 'The lecture links the four Sphinx gates with a set of “key” gates to describe shifts in history/listening, leadership/role, creativity/continuity, and direction/completion.',
 'The analysis maps Gate 13 to 61, Gate 7 to 62, Gate 1 to 32, and Gate 2 to 42 as interpretive pairings used in Ra’s account of the cycle transition.',
 jsonb_build_object('part',2,'evidence_type','derived_paraphrase','locator','Part 2 summary','mapping_status','interpretive pairing; confirm exact lecture phrasing'),
 'pending','staged','Paraphrase only; pairing is attributed to this lecture interpretation.',1),

('gc-04-facts-and-authority-window','ra-uru-hu-global-cycles-parts-1-5','cycle_interpretation',
 ARRAY['1961_2027','facts','authority','gate_62','gate_61'],
 'Ra describes the period from approximately 1961 to 2027 as emphasizing facts, detail, expertise, and inner truth, while warning that information alone cannot replace individual authority.',
 'In the outgoing cycle window, facts and experts may be prominent, but the practical HD response is to use information without surrendering Strategy and Authority.',
 jsonb_build_object('part',2,'evidence_type','derived_paraphrase','locator','Part 2 summary','date_range','approx. 1961–2027'),
 'pending','staged','Dates and interpretation are attributed to Ra’s model.',1),

('gc-05-tribal-bargain-to-individual-power','ra-uru-hu-global-cycles-parts-1-5','cycle_transition',
 ARRAY['channel_37_40','channel_20_34','tribal','individuality','2027'],
 'Ra contrasts the tribal bargain associated with 37–40 with the individual presence and power associated with 20–34 as the incoming global-cycle theme.',
 'The outgoing pattern emphasizes belonging and reciprocal obligations; the incoming pattern emphasizes present-moment individual action and self-directed response. This does not mean cooperation instantly disappears.',
 jsonb_build_object('parts',jsonb_build_array(2,3),'evidence_type','derived_paraphrase','locator','Parts 2–3 summaries'),
 'pending','staged','Paraphrase only; retain the distinction between a cycle theme and individual chart definition.',1),

('gc-06-old-imprint-fades-gradually','ra-uru-hu-global-cycles-parts-1-5','timeline_interpretation',
 ARRAY['2027','cross_of_planning','conditioning','generational_transition'],
 'The formal cycle transition and the gradual fading of social conditioning are different timelines in Ra’s explanation.',
 'The 2027 transition is not presented as an overnight disappearance of the old pattern; people and institutions shaped by the prior cycle may carry its imprint forward.',
 jsonb_build_object('parts',jsonb_build_array(2,3),'evidence_type','derived_paraphrase','locator','Parts 2–3 summaries'),
 'pending','staged','Paraphrase only.',1),

('gc-07-strategy-authority-individual-response','ra-uru-hu-global-cycles-parts-1-5','practical_guidance',
 ARRAY['strategy_and_authority','deconditioning','individuality'],
 'Ra’s practical guidance for individuals is to follow their own Strategy and Authority rather than attempt to save or reform humanity as a whole.',
 'The personal response is deconditioning one person at a time: reduce resistance by living according to one’s own mechanics, not by assuming collective structures will provide the answer.',
 jsonb_build_object('parts',jsonb_build_array(1,3),'evidence_type','derived_paraphrase','locator','Parts 1 and 3 summaries'),
 'pending','staged','Paraphrase only; frame as Human Design guidance, not universal instruction.',1),

('gc-08-gate32-to-gate57','ra-uru-hu-global-cycles-parts-1-5','mutation_interpretation',
 ARRAY['gate_32','gate_57','fear_of_failure','fear_of_tomorrow','survival'],
 'Ra interprets a shift from Gate 32 themes of continuity and fear of failure toward Gate 57 themes of intuitive awareness and fear of tomorrow.',
 'Within his model, the survival emphasis shifts from securing material continuity to responding intuitively in the present.',
 jsonb_build_object('part',4,'evidence_type','derived_paraphrase','locator','Part 4 summary','claim_kind','symbolic Human Design interpretation'),
 'pending','staged','Paraphrase only; symbolic framework claim.',1),

('gc-09-gate42-to-gate51','ra-uru-hu-global-cycles-parts-1-5','mutation_interpretation',
 ARRAY['gate_42','gate_51','completion','shock','courage'],
 'Ra contrasts Gate 42 themes of growth and completion with Gate 51 themes of shock, initiation, and courage in the incoming cycle narrative.',
 'The transition is framed as requiring courage to leave familiar tribal patterns; courage itself does not guarantee that a choice is correct.',
 jsonb_build_object('part',4,'evidence_type','derived_paraphrase','locator','Part 4 summary','claim_kind','symbolic Human Design interpretation'),
 'pending','staged','Paraphrase only; symbolic framework claim.',1),

('gc-10-rave-mutation-and-19-49','ra-uru-hu-global-cycles-parts-1-5','speculative_model_claim',
 ARRAY['rave','channel_19_49','solar_plexus','gate_55','mutation'],
 'Ra proposes that a future Rave form would differ biologically and experientially from humans, including a changed relationship to the 19–49 tribal channel.',
 'This is a speculative component of Ra’s Human Design model. Store it as an attributed theory, not as established biology or a basis for diagnosing any child.',
 jsonb_build_object('parts',jsonb_build_array(1,3,4,5),'evidence_type','derived_paraphrase','locator','Parts 1, 3, 4, and 5 summaries','epistemic_status','Ra’s proposed model; not validated medical fact'),
 'pending','staged','Paraphrase only. Do not turn into medical or developmental claims.',1),

('gc-11-conscious-penta','ra-uru-hu-global-cycles-parts-1-5','speculative_model_claim',
 ARRAY['conscious_penta','rave','group_consciousness','aura'],
 'Ra proposes that Rave consciousness would operate through a group/Penta configuration rather than only through isolated individual awareness, with three auras described as a minimum.',
 'In the lecture’s analogy, the group configuration is the locus of a proposed collective consciousness. This is a description of Ra’s theory, not an independently verified mechanism.',
 jsonb_build_object('part',5,'evidence_type','derived_paraphrase','locator','Part 5 summary','epistemic_status','Ra’s proposed model'),
 'pending','staged','Paraphrase only; preserve attribution and speculative status.',1),

('gc-12-rave-development-claims','ra-uru-hu-global-cycles-parts-1-5','speculative_model_claim',
 ARRAY['rave','development','sensory_processing','three_years'],
 'Ra speculates that a proposed Rave child would require a post-birth period of development and contact with others of its kind.',
 'The lecture includes speculative claims about a multi-year developmental process and altered sensory or bodily experience. These claims must not be used to infer that a real child is a Rave or to guide medical decisions.',
 jsonb_build_object('part',5,'evidence_type','derived_paraphrase','locator','Part 5 summary','epistemic_status','Ra’s proposed model; not validated medical fact'),
 'pending','staged','Paraphrase only; not medical advice or diagnostic criteria.',1),

('gc-13-sleeping-phoenix-cycle-timeline','ra-uru-hu-global-cycles-parts-1-5','timeline_interpretation',
 ARRAY['2027','sleeping_phoenix','2438','gate_30','aquarius'],
 'Ra places the beginning of the Cross of the Sleeping Phoenix around 2027 and describes a cycle lasting roughly four centuries, with Gate 30 associated with a later transition in his timeline.',
 'In this account, the Age of Aquarius is not equated with the 2027 transition; it belongs to the later timeline Ra discusses.',
 jsonb_build_object('part',5,'evidence_type','derived_paraphrase','locator','Part 5 summary','date_range','approx. 2027–2438; dates are approximate within Ra’s model'),
 'pending','staged','Paraphrase only; dates and astronomical framing require source-level verification.',1),

('gc-14-three-change-levels','ra-uru-hu-global-cycles-parts-1-5','synthesis',
 ARRAY['global_cycle','conditioning','mutation','2027','interpretation_boundaries'],
 'The lecture analysis distinguishes global-cycle change, changes in human conditioning, and Ra’s proposed biological mutation as related but non-identical claims.',
 'A cycle transition does not imply every individual’s chart changes, nor does the date itself establish that a proposed Rave child will appear. Keep the three levels separate when generating interpretations.',
 jsonb_build_object('parts',jsonb_build_array(1,2,3,4,5),'evidence_type','cross_part_synthesis','locator','Five-part synthesis'),
 'pending','staged','Derived synthesis; requires human review before becoming validated canon.',1)
on conflict (id) do update set
  source_id = excluded.source_id,
  record_type = excluded.record_type,
  concept_keys = excluded.concept_keys,
  claim = excluded.claim,
  concise_paraphrase = excluded.concise_paraphrase,
  provenance = excluded.provenance,
  validation_status = excluded.validation_status,
  lifecycle_status = excluded.lifecycle_status,
  licensing_notes = excluded.licensing_notes,
  version = excluded.version,
  updated_at = now();

insert into public.ky_knowledge_relationships
  (id, from_record_id, to_record_id, relationship_type, validation_status, evidence)
values
('gc-rel-planning-to-transition','gc-01-cross-of-planning-program','gc-05-tribal-bargain-to-individual-power','contrasts_with','pending',jsonb_build_object('basis','Cross-part synthesis')),
('gc-rel-transition-to-guidance','gc-05-tribal-bargain-to-individual-power','gc-07-strategy-authority-individual-response','informs','pending',jsonb_build_object('basis','Cross-part synthesis')),
('gc-rel-mutation-gate32-gate57','gc-08-gate32-to-gate57','gc-10-rave-mutation-and-19-49','related_to','pending',jsonb_build_object('basis','Part 4 summary')),
('gc-rel-rave-to-penta','gc-10-rave-mutation-and-19-49','gc-11-conscious-penta','develops_into','pending',jsonb_build_object('basis','Parts 4–5 summaries')),
('gc-rel-synthesis-boundaries','gc-14-three-change-levels','gc-10-rave-mutation-and-19-49','qualifies','pending',jsonb_build_object('basis','Five-part synthesis'))
on conflict (id) do update set
  from_record_id = excluded.from_record_id,
  to_record_id = excluded.to_record_id,
  relationship_type = excluded.relationship_type,
  validation_status = excluded.validation_status,
  evidence = excluded.evidence,
  updated_at = now();

commit;

-- ==============================================================================
-- SIGNBRIDGE AI — Database Seed Data
-- Comprehensive ASL Alphabet Library (A-Z) and Model Registry Baseline
-- ==============================================================================

INSERT INTO public.asl_alphabet (
    letter, description, gesture_type, media_url, thumbnail_url,
    media_source, attribution, license_name, verified,
    similar_letters, practice_tips, common_mistakes
) VALUES
('A', 'Fist made with all four fingers curled tightly down into the palm; the thumb rests upright straight against the index finger side without crossing over the fingers.',
 'static', '/assets/signs/A.svg', '/assets/signs/A.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['E', 'S', 'T', 'M', 'N'],
 ARRAY['Keep the thumb resting against the index finger side, pointing straight upward.', 'Do not tuck the thumb over your knuckles.'],
 ARRAY['Crossing thumb over the curled fingers (which turns it into S).', 'Curling thumb into the palm (which turns it into E).']),

('B', 'Flat open palm facing forward, fingers held vertically straight together; the thumb is folded across the palm below the knuckles.',
 'static', '/assets/signs/B.svg', '/assets/signs/B.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['4', 'D'],
 ARRAY['Keep all four fingers pressed tightly together pointing straight up.', 'Fold the thumb snugly across the palm.'],
 ARRAY['Spreading the fingers apart.', 'Leaving the thumb sticking out sideways.']),

('C', 'Hand curved smoothly in the shape of the letter C; fingers together arched downward and thumb curved up facing them with open space between.',
 'static', '/assets/signs/C.svg', '/assets/signs/C.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['O', 'E'],
 ARRAY['Maintain a distinct open arc between your thumb and fingertips.', 'Palm faces sideways slightly so the curve is visible.'],
 ARRAY['Closing the fingertips all the way to the thumb (which turns it into O).', 'Flattening the hand.']),

('D', 'Index finger points straight up; thumb, middle, ring, and pinky fingers form an enclosed circle with tips touching.',
 'static', '/assets/signs/D.svg', '/assets/signs/D.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['F', '1'],
 ARRAY['Only the index finger extends straight up.', 'Ensure the remaining three fingertips touch the pad of the thumb.'],
 ARRAY['Extending index, middle, and ring fingers (which is F).', 'Failing to close the circle with the other three fingers.']),

('E', 'All four fingers curled tightly so their tips rest on the top edge of the thumb; thumb is bent horizontally under the fingertips without sticking out.',
 'static', '/assets/signs/E.svg', '/assets/signs/E.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['A', 'S', 'O', 'C'],
 ARRAY['Fingertips curl back towards palm resting atop the thumb side.', 'Palm faces forward towards the viewer.'],
 ARRAY['Allowing fingers to float above thumb without touching.', 'Extending thumb out sideways.']),

('F', 'Index finger and thumb touch at the tips to form an open circle; middle, ring, and pinky fingers are extended straight up and slightly separated.',
 'static', '/assets/signs/F.svg', '/assets/signs/F.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['D', '9'],
 ARRAY['Fingertips of index and thumb touch cleanly.', 'Middle, ring, and pinky stand upright and proud.'],
 ARRAY['Confusing F with D (in D only the index extends; in F three fingers extend).', 'Clumping the three top fingers too tightly.']),

('G', 'Fist with index finger pointing horizontally sideways to the non-dominant side; thumb extends parallel to the index with a small gap between them.',
 'static', '/assets/signs/G.svg', '/assets/signs/G.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['H', 'Q', 'L'],
 ARRAY['Palm faces back towards your body or slightly inward.', 'Only the index and thumb point out horizontally.'],
 ARRAY['Pointing with two fingers (which is H).', 'Pointing downwards (which is Q).']),

('H', 'Index and middle fingers extended straight horizontally together side-by-side; thumb tucked alongside or behind middle finger.',
 'static', '/assets/signs/H.svg', '/assets/signs/H.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['G', 'U', 'N'],
 ARRAY['Keep both index and middle fingers locked horizontally together.', 'Palm orientation is angled inward towards the chest.'],
 ARRAY['Separating index and middle fingers.', 'Pointing only one finger.']),

('I', 'Fist with pinky finger pointing straight up vertically; thumb folds across the curled index, middle, and ring fingers.',
 'static', '/assets/signs/I.svg', '/assets/signs/I.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['J', 'Y'],
 ARRAY['Extend the pinky completely straight and vertical.', 'Thumb secures the curled fingers firmly.'],
 ARRAY['Adding dynamic downward scoop motion (which turns I into J).', 'Extending thumb (which turns it into Y).']),

('J', 'Dynamic motion gesture: Start in the static "I" handshape (pinky extended), then trace the curved letter "J" in the air by swooping the pinky down and curving back up.',
 'dynamic', '/assets/signs/J.svg', '/assets/signs/J.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['I', 'Z'],
 ARRAY['Start steady with I, then fluidly trace a hook stroke.', 'This is a motion-based sign requiring temporal trajectory tracking.'],
 ARRAY['Keeping hand completely static.', 'Moving whole arm instead of rotating wrist smoothly.']),

('K', 'Index finger extended vertically; middle finger extended diagonally forward and slightly up; thumb tip rests on the inner middle joint of the index finger.',
 'static', '/assets/signs/K.svg', '/assets/signs/K.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['P', 'V'],
 ARRAY['Index is upright, middle angles forward, thumb wedges between them touching index knuckle.'],
 ARRAY['Dropping wrist downward (which changes K into P).', 'Confusing with V (V has thumb folded over fingers).']),

('L', 'Index finger points straight up and thumb extends perpendicular at a 90-degree angle to form a crisp "L" shape; other fingers curled into palm.',
 'static', '/assets/signs/L.svg', '/assets/signs/L.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['G', 'D'],
 ARRAY['Maintain a crisp 90-degree right angle between thumb and index.', 'Palm faces forward.'],
 ARRAY['Bending the thumb inward.', 'Tilting the hand sideways.']),

('M', 'Fist where the thumb tucks underneath the first three fingers (index, middle, ring), with the thumb tip visibly peeking out between the ring and pinky fingers.',
 'static', '/assets/signs/M.svg', '/assets/signs/M.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['N', 'T', 'S', 'A'],
 ARRAY['Count three finger humps draped over the thumb.', 'Keep knuckle ridge level and palm forward.'],
 ARRAY['Tucking thumb under only two fingers (which is N).', 'Tucking thumb under only one finger (which is T).']),

('N', 'Fist where the thumb tucks underneath the first two fingers (index and middle), with the thumb tip emerging between middle and ring fingers.',
 'static', '/assets/signs/N.svg', '/assets/signs/N.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['M', 'T', 'H'],
 ARRAY['Two finger humps draped over the thumb.', 'Keep fingers held compactly.'],
 ARRAY['Draping three fingers (which is M).', 'Confusing with H (H is horizontal open fingers).']),

('O', 'All five fingertips curve gently inward to touch the tip of the thumb, forming a continuous circular "O" opening.',
 'static', '/assets/signs/O.svg', '/assets/signs/O.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['C', 'E'],
 ARRAY['All fingertips should contact the thumb tip gently.', 'The circular opening must be visible from the side or 3/4 view.'],
 ARRAY['Leaving an open gap (which is C).', 'Flattening fingers into palm (which is E).']),

('P', 'Same handshape as "K" (index up, middle forward, thumb wedged between), but with wrist angled downward so index points forward/down.',
 'static', '/assets/signs/P.svg', '/assets/signs/P.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['K', 'Q'],
 ARRAY['Keep the K finger configuration while tilting your wrist downward so the middle finger hangs down.'],
 ARRAY['Holding wrist upright (which is K).', 'Collapsing thumb away from the index joint.']),

('Q', 'Same handshape as "G" (index and thumb parallel), but with wrist tilted downward so both fingers point down towards the floor.',
 'static', '/assets/signs/Q.svg', '/assets/signs/Q.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['G', 'P'],
 ARRAY['Tilt hand downward from wrist.', 'Only index and thumb extend downward.'],
 ARRAY['Pointing horizontally (which is G).', 'Adding middle finger (which is P).']),

('R', 'Index and middle fingers extended straight up, crossed over each other with middle finger crossed behind or in front of index; other fingers curled.',
 'static', '/assets/signs/R.svg', '/assets/signs/R.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['U', 'V'],
 ARRAY['Middle finger crosses over index finger like good-luck fingers.', 'Thumb secures ring and pinky fingers.'],
 ARRAY['Holding fingers parallel without crossing (which is U).', 'Spreading fingers into a V.']),

('S', 'Fist where all four fingers curl tightly into palm, and the thumb folds completely across the front of the curled fingers.',
 'static', '/assets/signs/S.svg', '/assets/signs/S.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['A', 'E', 'T'],
 ARRAY['Thumb lays across the middle of your finger knuckles.', 'Fist is held compact and palm faces forward.'],
 ARRAY['Resting thumb on the side of index (which is A).', 'Tucking thumb under index (which is T).']),

('T', 'Fist where the thumb is tucked between the index and middle fingers, with thumb tip popping up between index knuckle and middle knuckle.',
 'static', '/assets/signs/T.svg', '/assets/signs/T.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['A', 'S', 'N', 'M'],
 ARRAY['Only the index finger drapes over the thumb.', 'The thumb tip pokes out between index and middle.'],
 ARRAY['Draping two fingers over thumb (which is N).', 'Resting thumb across fingers (which is S).']),

('U', 'Index and middle fingers extended straight up, pressed tightly together side-by-side; thumb folds across ring and pinky fingers.',
 'static', '/assets/signs/U.svg', '/assets/signs/U.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['V', 'R', 'H'],
 ARRAY['Index and middle fingers must touch along their full vertical length.', 'Hold upright and still.'],
 ARRAY['Spreading fingers apart (which is V).', 'Crossing fingers (which is R).']),

('V', 'Index and middle fingers extended straight up and spread apart to form a "V" (peace sign); thumb holds down ring and pinky.',
 'static', '/assets/signs/V.svg', '/assets/signs/V.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['U', 'K', '2'],
 ARRAY['Keep clear separation between index and middle fingers in a V angle.', 'Palm faces forward.'],
 ARRAY['Holding fingers touching (which is U).', 'Wedging thumb between fingers (which is K).']),

('W', 'Index, middle, and ring fingers extended straight up and separated into a "W" shape (number 3 sign); thumb holds down the pinky.',
 'static', '/assets/signs/W.svg', '/assets/signs/W.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['V', '6'],
 ARRAY['Three central fingers stand tall and spread evenly.', 'Thumb secures pinky tip firmly.'],
 ARRAY['Extending pinky instead of index.', 'Clumping three fingers together.']),

('X', 'Fist with index finger curled into a small hook or question-mark shape; thumb rests against curled middle finger.',
 'static', '/assets/signs/X.svg', '/assets/signs/X.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['E', 'S'],
 ARRAY['Bend index finger at the second joint into a distinct hook.', 'Palm faces forward or 3/4 view.'],
 ARRAY['Extending index finger straight.', 'Flattening finger completely into palm.']),

('Y', 'Thumb and pinky finger extended outward in a "hang loose" or "shaka" shape; middle three fingers curled tightly against the palm.',
 'static', '/assets/signs/Y.svg', '/assets/signs/Y.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['I', 'J'],
 ARRAY['Extend both thumb and pinky far apart.', 'Middle three fingers held down tightly against palm.'],
 ARRAY['Folding thumb (which is I).', 'Angling hand upside down.']),

('Z', 'Dynamic motion gesture: Index finger extended straight out pointing forward (fist shape with other fingers); trace the shape of the letter "Z" in the air with the index fingertip.',
 'dynamic', '/assets/signs/Z.svg', '/assets/signs/Z.svg',
 'SIGNBRIDGE Verified Library', 'American Sign Language Reference Standard', 'CC-BY-4.0', TRUE,
 ARRAY['D', '1', 'J'],
 ARRAY['Point index finger forward, trace horizontal right, diagonal down-left, horizontal right.', 'Motion gesture requiring temporal path analysis.'],
 ARRAY['Holding index finger completely still (which looks like D/1).', 'Tracing with whole arm rather than smooth wrist motion.'])
ON CONFLICT (letter) DO UPDATE SET
    description = EXCLUDED.description,
    gesture_type = EXCLUDED.gesture_type,
    media_url = EXCLUDED.media_url,
    thumbnail_url = EXCLUDED.thumbnail_url,
    media_source = EXCLUDED.media_source,
    attribution = EXCLUDED.attribution,
    license_name = EXCLUDED.license_name,
    verified = EXCLUDED.verified,
    similar_letters = EXCLUDED.similar_letters,
    practice_tips = EXCLUDED.practice_tips,
    common_mistakes = EXCLUDED.common_mistakes,
    updated_at = NOW();

-- Seed initial Model Registry baseline
INSERT INTO public.model_registry (
    model_name, model_version, model_path, framework,
    supported_letters, accuracy, evaluation_metadata, active
) VALUES (
    'SIGNBRIDGE ASL Static Classifier',
    'asl-static-v1',
    '/models/asl-static-v1/model.json',
    'TensorFlow.js',
    ARRAY['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y'],
    0.96500,
    '{
        "input_features": 63,
        "landmark_count": 21,
        "spatial_normalization": "wrist_origin_max_span",
        "training_epochs": 60,
        "val_accuracy": 0.965,
        "dynamic_gestures": {
            "J": "temporal_trajectory_tracking",
            "Z": "temporal_trajectory_tracking"
        }
    }'::jsonb,
    TRUE
)
ON CONFLICT (model_version) DO NOTHING;

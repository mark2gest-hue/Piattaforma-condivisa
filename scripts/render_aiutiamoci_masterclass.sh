#!/bin/bash
set -e

DIR="/Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa"
SRC_VIDEO="$DIR/recordings/promo_aiutiamoci_cloud.mp4"
BANNER="$DIR/recordings/assets_masterclass/banner_intro.png"
BADGE="$DIR/recordings/assets_masterclass/badge_top.png"
LOWER="$DIR/recordings/assets_masterclass/lower_third.png"
CARD1="$DIR/recordings/assets_masterclass/card_step1_iscrizione.png"
CARD2="$DIR/recordings/assets_masterclass/card_step2_codice.png"
CARD3="$DIR/recordings/assets_masterclass/card_step3_pro.png"
OUT_VIDEO="$DIR/recordings/promo_aiutiamoci_MASTERCLASS_v2.mp4"

echo "🎬 Assemblaggio video AIutiamoci stile Masterclass con Motion Transitions..."

ffmpeg -y \
  -i "$SRC_VIDEO" \
  -i "$BANNER" \
  -i "$BADGE" \
  -i "$LOWER" \
  -i "$CARD1" \
  -i "$CARD2" \
  -i "$CARD3" \
  -filter_complex "
    [0:v]fps=30,scale=1920:1080[v0];
    [1:v]format=rgba[b_intro];
    [2:v]format=rgba[b_top];
    [3:v]format=rgba[b_lower];
    [4:v]format=rgba[c1];
    [5:v]format=rgba[c2];
    [6:v]format=rgba[c3];

    [v0][b_intro]overlay=x=(W-w)/2:y='if(lt(t,0.8), -h + (220+h)*(1-pow(1-(t-0.3)/0.5, 3)), if(gt(t,3.4), 220 - (220+h)*(pow((t-3.4)/0.4, 2)), 220))':enable='between(t,0.3,3.9)'[v_intro];

    [v_intro][b_top]overlay=x=50:y='if(lt(t,4.4), -h + (50+h)*(1-pow(1-(t-4.0)/0.4, 3)), 50)':enable='gte(t,4.0)'[v_top];

    [v_top][b_lower]overlay=x=50:y='if(lt(t,4.5), H - (140)*(1-pow(1-(t-4.1)/0.4, 3)), if(gt(t,9.4), (H-140) + 200*(pow((t-9.4)/0.4, 2)), H-140))':enable='between(t,4.1,10.0)+between(t,13.0,18.5)+between(t,22.0,27.5)'[v_with_lower];

    [v_with_lower][c1]overlay=x=W-w-50:y='if(lt(t,4.6), -h + (160+h)*(1-pow(1-(t-4.1)/0.5, 3)), if(gt(t,11.4), 160 + (H-160)*(pow((t-11.4)/0.5, 2)), 160))':enable='between(t,4.1,12.0)'[v_c1];
    [v_c1][c2]overlay=x=W-w-50:y='if(lt(t,13.1), -h + (160+h)*(1-pow(1-(t-12.6)/0.5, 3)), if(gt(t,19.4), 160 + (H-160)*(pow((t-19.4)/0.5, 2)), 160))':enable='between(t,12.6,20.0)'[v_c2];
    [v_c2][c3]overlay=x=W-w-50:y='if(lt(t,21.6), -h + (160+h)*(1-pow(1-(t-21.1)/0.5, 3)), if(gt(t,29.4), 160 + (H-160)*(pow((t-29.4)/0.5, 2)), 160))':enable='between(t,21.1,30.0)'[outv]
  " \
  -map "[outv]" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -crf 19 \
  -preset fast \
  "$OUT_VIDEO"

echo "✅ Render completato con successo: $OUT_VIDEO"
open "$OUT_VIDEO"

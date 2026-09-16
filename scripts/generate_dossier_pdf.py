import os
import base64
import subprocess
import shutil

project_dir = "/Users/marco/Sviluppo/Progetti/Prgetto piattaforma lavoro condivisa"
logo_path = os.path.join(project_dir, "public/images/logo_full_light.png")

with open(logo_path, "rb") as f:
    logo_base64 = base64.b64encode(f.read()).decode("utf-8")

html_content = f"""<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    size: A4;
    margin: 18mm 15mm 18mm 15mm;
    @bottom-left {{
      content: "aiutiamoci.cloud • Piattaforma Formativa & Operativa AI";
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 8pt;
      color: #888888;
    }}
    @bottom-right {{
      content: "Pagina " counter(page) " di " counter(pages);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 8pt;
      color: #888888;
      font-weight: bold;
    }}
  }}

  body {{
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.45;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
  }}

  /* HEADER / CARTA INTESTATA */
  .letterhead {{
    border-bottom: 2.5px solid #0284c7;
    padding-bottom: 12px;
    margin-bottom: 16px;
    display: table;
    width: 100%;
  }}
  .letterhead-left {{
    display: table-cell;
    vertical-align: middle;
    width: 45%;
  }}
  .letterhead-right {{
    display: table-cell;
    vertical-align: middle;
    text-align: right;
    width: 55%;
    font-size: 8.5pt;
    color: #475569;
    line-height: 1.35;
  }}
  .logo {{
    height: 46px;
    max-width: 220px;
    object-fit: contain;
  }}

  .doc-meta {{
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 9px 14px;
    margin-bottom: 16px;
    display: table;
    width: 100%;
    box-sizing: border-box;
  }}
  .doc-meta-col {{
    display: table-cell;
    vertical-align: top;
    width: 50%;
    font-size: 8.5pt;
  }}
  .doc-meta-col strong {{
    color: #0f172a;
  }}

  h1 {{
    font-size: 14pt;
    color: #0f172a;
    margin: 0 0 4px 0;
    font-weight: 800;
    letter-spacing: -0.3px;
  }}
  .subtitle {{
    font-size: 10pt;
    color: #0284c7;
    font-weight: 600;
    margin-bottom: 12px;
  }}

  h2 {{
    font-size: 10.5pt;
    color: #0f172a;
    border-left: 3.5px solid #0284c7;
    padding-left: 8px;
    margin-top: 14px;
    margin-bottom: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }}

  p {{
    margin: 0 0 7px 0;
    text-align: justify;
  }}

  /* TABELLA MONTE ORE */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 8.5pt;
  }}
  th {{
    background-color: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 6px 10px;
    font-weight: 600;
  }}
  td {{
    padding: 6px 10px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }}
  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}
  .totale-row td {{
    background-color: #f0fdf4 !important;
    font-weight: bold;
    border-top: 2px solid #22c55e;
    color: #166534;
    font-size: 9pt;
  }}

  .badge-ore {{
    background-color: #e0f2fe;
    color: #0369a1;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    white-space: nowrap;
  }}

  /* HIGHLIGHT BOXES */
  .callout {{
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #0284c7;
    border-radius: 4px;
    padding: 8px 11px;
    margin-bottom: 8px;
    font-size: 8pt;
  }}
  .callout-title {{
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
  }}

  .grid-2 {{
    display: table;
    width: 100%;
    margin-top: 6px;
  }}
  .col-2 {{
    display: table-cell;
    width: 48%;
    vertical-align: top;
    padding-right: 4%;
  }}
  .col-2:last-child {{
    padding-right: 0;
  }}

  .cert-box {{
    border: 1.5px dashed #0284c7;
    background-color: #f0f9ff;
    border-radius: 6px;
    padding: 10px 14px;
    margin-top: 10px;
    font-size: 8.5pt;
  }}

  ul {{
    margin: 4px 0 8px 0;
    padding-left: 18px;
    font-size: 8.5pt;
  }}
  li {{
    margin-bottom: 3px;
  }}

  .signatures {{
    margin-top: 20px;
    display: table;
    width: 100%;
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
  }}
  .signature-box {{
    display: table-cell;
    width: 50%;
    vertical-align: top;
    font-size: 8.5pt;
  }}
  .sig-line {{
    margin-top: 32px;
    width: 75%;
    border-bottom: 1px solid #94a3b8;
  }}

  .page-break {{
    page-break-before: always;
  }}
</style>
</head>
<body>

  <!-- CARTA INTESTATA PAGINA 1 -->
  <div class="letterhead">
    <div class="letterhead-left">
      <img class="logo" src="data:image/png;base64,{logo_base64}" alt="aiutiamoci SVILUPPO">
    </div>
    <div class="letterhead-right">
      <strong>AIUTIAMOCI • Piattaforma Formazione & Sviluppo AI</strong><br>
      Web: <span style="color:#0284c7; font-weight:600;">https://aiutiamoci.cloud</span> • Email: info@aiutiamoci.cloud<br>
      Divisione Didattica & Certificazioni Aziendali
    </div>
  </div>

  <div class="doc-meta">
    <div class="doc-meta-col">
      <strong>DOCUMENTO:</strong> Dossier Tecnico Didattico & Accordo Erogazione<br>
      <strong>DESTINATARIO:</strong> Spett.le Direzione Tecnica & Formazione — <strong>ATOMA</strong><br>
      <strong>OGGETTO:</strong> Standard Erogazione Percorsi Certificati (16 Ore)
    </div>
    <div class="doc-meta-col" style="text-align: right;">
      <strong>DATA EMISSIONE:</strong> 16 Settembre 2026<br>
      <strong>REVISIONE:</strong> Rev. 1.2 — 16H Blended Accredited<br>
      <strong>STATO:</strong> Conforme Standard DigComp 2.2
    </div>
  </div>

  <h1>Dossier Tecnico di Certificazione Formativa</h1>
  <div class="subtitle">Architettura di Erogazione, Tracciamento e Valutazione Competenze AI (16 Ore Certificate)</div>

  <p>
    Il presente documento formalizza la struttura metodologica, tecnologica e didattica adottata dalla piattaforma 
    <strong>aiutiamoci.cloud</strong> per l'erogazione dei percorsi formativi in Intelligenza Artificiale Applicata. 
    L'architettura è stata ingegnerizzata nel rigoroso rispetto dei requisiti di trasparenza, verificabilità 
    e continuità didattica richiesti dagli organismi di certificazione delle competenze professionali.
  </p>

  <h2>1. Architettura Metodologica: Modello Blended Learning (16 Ore)</h2>
  <p>
    Per garantire una reale acquisizione delle competenze operative senza incorrere nell'inefficacia 
    della fruizione video puramente passiva, il monte ore complessivo di <strong>16 Ore</strong> è 
    organizzato in una formula mista ad altissimo coinvolgimento pratico:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Modulo & Componente</th>
        <th style="width: 18%;">Tipologia</th>
        <th style="width: 15%;">Ore Riconosciute</th>
        <th style="width: 42%;">Attività e Modalità Operativa</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>20 Video Lezioni Asincrone</strong></td>
        <td>FAD / Microlearning</td>
        <td><span class="badge-ore">4.0 Ore</span></td>
        <td>Pillole video da 10-12 min con slide dinamiche, picture-in-picture e dimostrazioni a video.</td>
      </tr>
      <tr>
        <td><strong>Live Workshop & Q&A</strong></td>
        <td>Sincrono (Webinar)</td>
        <td><span class="badge-ore">4.0 Ore</span></td>
        <td>Sessioni live interattive su Google Meet per approfondimenti, casi studio reali e correzione guidata.</td>
      </tr>
      <tr>
        <td><strong>Laboratorio & Missioni Pratiche</strong></td>
        <td>Laboratorio Asincrono</td>
        <td><span class="badge-ore">6.0 Ore</span></td>
        <td>5 missioni applicative nella <em>Zona Compiti</em> (Prompt RCCF, Branching, KB anti-allucinazione, Automazioni) con correzione Tutor AI.</td>
      </tr>
      <tr>
        <td><strong>Studio Dispense & Manuali</strong></td>
        <td>Auto-Apprendimento</td>
        <td><span class="badge-ore">1.5 Ore</span></td>
        <td>Consultazione dispense PDF, schede operative di sintesi e libreria prompt pronti all'uso.</td>
      </tr>
      <tr>
        <td><strong>Esame Finale di Certificazione</strong></td>
        <td>Valutazione Formale</td>
        <td><span class="badge-ore">0.5 Ore (30 min)</span></td>
        <td>Test randomizzato a risposta multipla su piattaforma protetta con soglia minima di superamento (80%).</td>
      </tr>
      <tr class="totale-row">
        <td colspan="2"><strong>MONTE ORE COMPLESSIVO CERTIFICABILE</strong></td>
        <td><strong>16.0 ORE</strong></td>
        <td><strong>Percorso completo conforme agli standard di certificazione.</strong></td>
      </tr>
    </tbody>
  </table>

  <h2>2. Sistema di Tracciamento, Frequenza e Audit Log Digitale</h2>
  <p>
    La piattaforma <code>aiutiamoci.cloud</code> integra un motore automatico di monitoraggio continuo e certificazione delle presenze:
  </p>

  <div class="grid-2">
    <div class="col-2">
      <div class="callout">
        <div class="callout-title">⏱️ Tracciamento Minutaggio Video (Watch-Time)</div>
        Il player monitora i secondi effettivi riprodotti. Il modulo viene validato solo al raggiungimento dell'<strong>85% del minutaggio</strong>, inibendo il salto rapido.
      </div>
      <div class="callout">
        <div class="callout-title">👥 Registro Presenze Sessioni Live</div>
        Rilevazione automatica dei partecipanti collegati e tracciamento della fruizione asincrona delle registrazioni integrali archiviate.
      </div>
    </div>
    <div class="col-2">
      <div class="callout">
        <div class="callout-title">🔒 Sblocco Condizionale Esame Finale</div>
        L'accesso al test finale è subordinato al superamento del 100% delle video-lezioni e all'esito positivo delle 5 missioni pratiche.
      </div>
      <div class="callout">
        <div class="callout-title">📑 Registro Esportabile per Auditor</div>
        Generazione di report individuali e di gruppo (CSV/PDF) con log temporali certificati per verifiche di conformità da parte di ATOMA.
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- CARTA INTESTATA PAGINA 2 -->
  <div class="letterhead">
    <div class="letterhead-left">
      <img class="logo" src="data:image/png;base64,{logo_base64}" alt="aiutiamoci SVILUPPO">
    </div>
    <div class="letterhead-right">
      <strong>AIUTIAMOCI.CLOUD • Allegato Tecnico Certificazione</strong><br>
      Dossier Monte Ore (16 Ore) • Convenzione ATOMA
    </div>
  </div>

  <h2>3. Protocollo di Valutazione Finale e Criteri di Idoneità</h2>
  <p>
    L'esame di certificazione finale è strutturato per verificare sia la comprensione concettuale 
    sia la capacità di applicazione operativa dei sistemi di intelligenza artificiale:
  </p>

  <ul>
    <li><strong>Struttura Test:</strong> 20 quesiti a risposta multipla estratti casualmente da una banca dati certificata di oltre 60 domande categorizzate.</li>
    <li><strong>Tempo Limite:</strong> 30 minuti continui con timer a video non interrompibile.</li>
    <li><strong>Soglia di Superamento:</strong> Minimo <strong>80% di accuratezza</strong> (16 risposte corrette su 20).</li>
    <li><strong>Politica Tentativi:</strong> Massimo 3 tentativi consentiti, con intervallo minimo di 24 ore tra un tentativo e l'altro per il ripasso guidato con il Tutor AI.</li>
  </ul>

  <h2>4. Certificato Ufficiale e Verificabilità Crittografica</h2>
  <p>
    Al superamento con esito positivo dell'esame, la piattaforma provvede istantaneamente alla generazione 
    del certificato digitale con le seguenti caratteristiche:
  </p>

  <div class="cert-box">
    <strong>Caratteristiche dell'Attestato Rilasciato:</strong>
    <ul style="margin: 6px 0 0 0; padding-left: 18px;">
      <li><strong>Intestazione Co-Branded:</strong> Loghi congiunti <strong>ATOMA • AIUTIAMOCI.CLOUD</strong>.</li>
      <li><strong>Dati Anagrafici & Monte Ore:</strong> Nome, Cognome, Data Esame, Votazione e dicitura esplicita <em>"16 Ore di Formazione Professionale Certificata"</em>.</li>
      <li><strong>Identificativo Univoco & QR Code:</strong> Codice alfanumerico crittografico (es. <code>CERT-AI-START-8F92-2026</code>) e link pubblico per la verifica istantanea dell'autenticità da parte di datori di lavoro o terzi verificatori.</li>
      <li><strong>Quadro Competenze Acquisite:</strong> Dettaglio delle abilità operative conformi al framework europeo DigComp 2.2.</li>
    </ul>
  </div>

  <h2>5. Sottoscrizione e Approvazione</h2>
  <p>
    La presente proposta tecnica è stata redatta e approvata dalla Direzione Didattica di <strong>aiutiamoci.cloud</strong> 
    ed è sottoposta alla validazione dell'Ente Certificatore <strong>ATOMA</strong> per la formalizzazione dell'accordo operativo.
  </p>

  <div class="signatures">
    <div class="signature-box">
      <strong>Per la Direzione Didattica & Scientifica</strong><br>
      <em>aiutiamoci.cloud / Mark2 Sviluppo</em>
      <div class="sig-line"></div>
      <span style="font-size: 8pt; color: #64748b;">Firma del Responsabile Didattico</span>
    </div>
    <div class="signature-box">
      <strong>Per l'Ente di Certificazione</strong><br>
      <em>ATOMA — Comitato Tecnico Scientifico</em>
      <div class="sig-line"></div>
      <span style="font-size: 8pt; color: #64748b;">Firma per Accettazione & Accreditamento</span>
    </div>
  </div>

</body>
</html>
"""

html_path = os.path.join(project_dir, "scratch_dossier.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

pdf_proj = os.path.join(project_dir, "Dossier_Certificazione_ATOMA_16_Ore.pdf")
pdf_public = os.path.join(project_dir, "public/docs/Dossier_Certificazione_ATOMA_16_Ore.pdf")
pdf_downloads = os.path.expanduser("~/Downloads/Dossier_Certificazione_ATOMA_16_Ore_Aiutiamoci.pdf")
pdf_vault = "/Users/marco/Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/01_Progetti/Dossier_Certificazione_ATOMA_16_Ore.pdf"

os.makedirs(os.path.join(project_dir, "public/docs"), exist_ok=True)
os.makedirs(os.path.dirname(pdf_vault), exist_ok=True)

weasy_bin = "/opt/homebrew/bin/weasyprint"
res = subprocess.run([weasy_bin, html_path, pdf_proj], capture_output=True, text=True)
if res.returncode != 0:
    print("Errore Weasyprint:", res.stderr)
else:
    shutil.copyfile(pdf_proj, pdf_public)
    shutil.copyfile(pdf_proj, pdf_downloads)
    shutil.copyfile(pdf_proj, pdf_vault)
    print("Successo! PDF compilato e distribuito in:")
    print("- Root Progetto:", pdf_proj)
    print("- Web Public:", pdf_public)
    print("- Downloads:", pdf_downloads)
    print("- Obsidian Vault:", pdf_vault)

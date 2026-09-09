/**
 * Generatore del Canvas Grafico Interattivo n8n per l'Agente Mira / Workshop Agenti.
 * Renderizza un vero canvas a nodi interconnessi con animazioni SVG, simulazione live e ispezione JSON.
 */

export function generateN8nCanvasHtml(initialType: 'video_factory' | 'triage_email' = 'video_factory'): string {
  return `
<div id="n8n-canvas-root" style="background: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-radius: 18px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); user-select: none;">
  
  <!-- Header Barra Strumenti -->
  <div style="background: #0f172a; padding: 12px 16px; border-bottom: 1px solid #1e293b; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; box-shadow: 0 0 12px rgba(249,115,22,0.5);">
        ⚡
      </div>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 6px;">
          n8n Workflow Engine
          <span style="background: #064e3b; color: #34d399; font-size: 10px; padding: 2px 6px; border-radius: 999px; border: 1px solid #059669;">
            ● v2.8.4 Live
          </span>
        </div>
        <div style="font-size: 11px; color: #64748b;">Host: n8n.mark2.cloud (Oracle Cloud VPS)</div>
      </div>
    </div>

    <!-- Switcher Flusso & Esecuzione -->
    <div style="display: flex; align-items: center; gap: 8px;">
      <button id="btn-wf-video" onclick="switchWorkflowView('video')" style="background: #ea580c; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
        🎬 Video Factory 9:16
      </button>
      <button id="btn-wf-email" onclick="switchWorkflowView('email')" style="background: #1e293b; color: #94a3b8; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
        📧 Triage Email Aruba
      </button>
      <button onclick="triggerN8nLiveSimulation()" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 0 15px rgba(16,185,129,0.35);">
        <span>▶️ Simula Flusso</span>
      </button>
    </div>
  </div>

  <!-- Canvas Nodi Visivi con Griglia Blueprint -->
  <div style="position: relative; background-color: #050811; background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 20px 20px; padding: 28px 16px; overflow-x: auto; min-height: 220px;">
    
    <!-- Contenitore Nodi Orizzontali -->
    <div id="nodes-container" style="display: flex; align-items: center; gap: 14px; min-width: 720px; justify-content: space-between;">
      <!-- Generato dinamicamente via JS -->
    </div>

  </div>

  <!-- Drawer Ispezione Dati Nodo -->
  <div style="background: #0a0f1d; border-top: 1px solid #1e293b; padding: 14px 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
        🔍 Ispezione Nodo: <span id="inspector-node-title" style="color: #f8fafc;">Seleziona un nodo</span>
      </div>
      <div id="inspector-node-status" style="font-size: 11px; color: #94a3b8; font-family: monospace;">
        Stato: Pronto
      </div>
    </div>

    <div style="background: #020617; border: 1px solid #1e293b; border-radius: 10px; padding: 10px; font-family: monospace; font-size: 11px; color: #cbd5e1; max-height: 110px; overflow-y: auto; white-space: pre-wrap;" id="inspector-node-payload">
// Fai clic su un nodo qualsiasi o premi "Simula Flusso" per visualizzare il payload JSON in tempo reale.
    </div>
  </div>

  <!-- Script Logico del Canvas -->
  <script>
    (function() {
      var currentWf = '${initialType === 'triage_email' ? 'email' : 'video'}';
      var activeNodeId = null;

      var WORKFLOWS = {
        video: [
          {
            id: 'v1',
            type: 'schedule',
            icon: '⏱️',
            color: '#f97316',
            label: 'Schedule Trigger',
            sub: 'Cron 08:00 AM (7/7)',
            jsonIn: { trigger: 'cron', interval: 'daily', time: '08:00' },
            jsonOut: { day: 'Mercoledì', target: 'Privati/Base', format: 'Reel 9:16' }
          },
          {
            id: 'v2',
            type: 'ai',
            icon: '🧠',
            color: '#8b5cf6',
            label: 'Gemini 2.5 Flash',
            sub: 'Hook & Copy JSON',
            jsonIn: { prompt: 'Genera Reel 9:16 per principianti' },
            jsonOut: { hook: 'Stop al copia-incolla manuale', pexels_query: 'person typing coffee laptop vertical' }
          },
          {
            id: 'v3',
            type: 'api',
            icon: '🎬',
            color: '#06b6d4',
            label: 'Pexels Video API',
            sub: 'Download 1080x1920',
            jsonIn: { query: 'person typing laptop', min_width: 1080 },
            jsonOut: { file: 'b_roll_reel.mp4', size: '14.2 MB', duration: '18s' }
          },
          {
            id: 'v4',
            type: 'storage',
            icon: '💾',
            color: '#10b981',
            label: 'Supabase Storage',
            sub: 'Bucket marketing-media',
            jsonIn: { bucket: 'marketing-media', filename: 'reel_video.mp4' },
            jsonOut: { public_url: 'https://supabase.co/storage/v1/s/reel_video.mp4' }
          },
          {
            id: 'v5',
            type: 'dispatch',
            icon: '🚀',
            color: '#ec4899',
            label: 'Buffer & Telegram',
            sub: 'Human-in-the-Loop & Reel',
            jsonIn: { channels: ['Facebook', 'Instagram Reels'], telegram_preview: true },
            jsonOut: { status: 'published', buffer_id: 'post_849204', reach: 'attivo' }
          }
        ],
        email: [
          {
            id: 'e1',
            type: 'mail',
            icon: '📬',
            color: '#f97316',
            label: 'IMAP Aruba 5 Inboxes',
            sub: 'Polling continuo 24/7',
            jsonIn: { accounts: ['info@aiutiamoci.cloud', 'assistenza@aiutiamoci.cloud'] },
            jsonOut: { from: 'mario.rossi@azienda.it', subject: 'Vorrei info corso agenti' }
          },
          {
            id: 'e2',
            type: 'ai',
            icon: '🧠',
            color: '#8b5cf6',
            label: 'Gemini Triage Flash',
            sub: 'Classificazione Lead',
            jsonIn: { body: 'Vorrei iscrivere 2 collaboratori al corso di automazione' },
            jsonOut: { category: 'CORSO_AGENTI_AI', lead_score: 9, level: 'PMI' }
          },
          {
            id: 'e3',
            type: 'switch',
            icon: '🔀',
            color: '#eab308',
            label: 'Switch Routing',
            sub: 'Filtro Anti-Spam & Lead',
            jsonIn: { category: 'CORSO_AGENTI_AI' },
            jsonOut: { branch: 'qualified_lead_path' }
          },
          {
            id: 'e4',
            type: 'db',
            icon: '💾',
            color: '#10b981',
            label: 'Supabase DB Lead',
            sub: 'Tabella waitlist_leads',
            jsonIn: { email: 'mario.rossi@azienda.it', seats: 2 },
            jsonOut: { inserted_id: 'lead_99382', status: 'pending_contact' }
          },
          {
            id: 'e5',
            type: 'alert',
            icon: '📲',
            color: '#38bdf8',
            label: 'SMTP & Telegram Alert',
            sub: 'Autoresponder + Notifica',
            jsonIn: { lead_id: 'lead_99382' },
            jsonOut: { email_sent: 'info@aiutiamoci.cloud (Aruba SSL)', telegram: 'Alert inviato a Marco e soci!' }
          }
        ]
      };

      function renderNodes() {
        var list = WORKFLOWS[currentWf];
        var container = document.getElementById('nodes-container');
        if (!container) return;

        var html = '';
        list.forEach(function(node, idx) {
          var isSelected = activeNodeId === node.id;
          html += '<div id="node-' + node.id + '" onclick="selectNodeById(\\'' + node.id + '\\')" style="flex: 1; min-width: 125px; background: #0b1329; border: 1.5px solid ' + (isSelected ? '#38bdf8' : node.color) + '; border-radius: 12px; padding: 10px; cursor: pointer; transition: all 0.25s; box-shadow: ' + (isSelected ? '0 0 16px #38bdf8' : '0 4px 12px rgba(0,0,0,0.3)') + '; position: relative;">';
          html += '  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">';
          html += '    <span style="font-size: 16px;">' + node.icon + '</span>';
          html += '    <span id="badge-' + node.id + '" style="font-size: 9px; font-weight: 700; color: ' + node.color + '; background: ' + node.color + '15; padding: 1px 6px; border-radius: 999px; border: 1px solid ' + node.color + '40;">Pronto</span>';
          html += '  </div>';
          html += '  <div style="font-size: 11px; font-weight: 700; color: #f8fafc; line-height: 1.2; margin-bottom: 2px;">' + node.label + '</div>';
          html += '  <div style="font-size: 9px; color: #94a3b8;">' + node.sub + '</div>';
          html += '</div>';

          if (idx < list.length - 1) {
            html += '<div id="arrow-' + node.id + '" style="color: #475569; font-weight: bold; font-size: 16px; transition: color 0.3s;">➔</div>';
          }
        });

        container.innerHTML = html;
        if (!activeNodeId) selectNodeById(list[0].id);
      }

      window.switchWorkflowView = function(type) {
        currentWf = type;
        activeNodeId = null;
        var btnVideo = document.getElementById('btn-wf-video');
        var btnEmail = document.getElementById('btn-wf-email');
        if (type === 'video') {
          btnVideo.style.background = '#ea580c';
          btnVideo.style.color = 'white';
          btnEmail.style.background = '#1e293b';
          btnEmail.style.color = '#94a3b8';
        } else {
          btnEmail.style.background = '#ea580c';
          btnEmail.style.color = 'white';
          btnVideo.style.background = '#1e293b';
          btnVideo.style.color = '#94a3b8';
        }
        renderNodes();
      };

      window.selectNodeById = function(nodeId) {
        activeNodeId = nodeId;
        var list = WORKFLOWS[currentWf];
        var found = list.find(function(n) { return n.id === nodeId; });
        if (!found) return;

        list.forEach(function(n) {
          var el = document.getElementById('node-' + n.id);
          if (el) {
            el.style.borderColor = (n.id === nodeId) ? '#38bdf8' : n.color;
            el.style.boxShadow = (n.id === nodeId) ? '0 0 16px #38bdf8' : 'none';
          }
        });

        document.getElementById('inspector-node-title').innerText = found.label + ' (' + found.sub + ')';
        document.getElementById('inspector-node-status').innerText = 'Tipo: ' + found.type.toUpperCase();
        document.getElementById('inspector-node-payload').innerText = JSON.stringify({
          nodeId: found.id,
          tipo_operazione: found.label,
          input_payload: found.jsonIn,
          output_generato: found.jsonOut
        }, null, 2);
      };

      window.triggerN8nLiveSimulation = function() {
        var list = WORKFLOWS[currentWf];
        var delay = 0;

        list.forEach(function(n, index) {
          setTimeout(function() {
            var badge = document.getElementById('badge-' + n.id);
            var nodeEl = document.getElementById('node-' + n.id);
            var arrowEl = document.getElementById('arrow-' + n.id);

            if (badge) {
              badge.innerText = '⚡ Esecuzione...';
              badge.style.color = '#fef08a';
            }
            if (nodeEl) {
              nodeEl.style.boxShadow = '0 0 20px ' + n.color;
            }
            selectNodeById(n.id);

            setTimeout(function() {
              if (badge) {
                badge.innerText = '✓ 200 OK';
                badge.style.color = '#34d399';
              }
              if (arrowEl) {
                arrowEl.style.color = '#38bdf8';
              }
            }, 500);

          }, delay);
          delay += 700;
        });

        setTimeout(function() {
          document.getElementById('inspector-node-status').innerText = '🎉 Flusso Eseguito con Successo!';
        }, delay + 200);
      };

      renderNodes();
    })();
  </script>
</div>
  `.trim()
}

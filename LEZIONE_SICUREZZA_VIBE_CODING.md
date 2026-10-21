# 🛡️ MASTERCLASS SICUREZZA & VIBE CODING: DAI RISCHI NASCOSTI ALLE APP BLINDATE

> **Destinatari**: Imprenditori, Professionisti, Manager e "Vibe Coders" (chi usa l'IA per creare script, software, form e automazioni aziendali senza essere un programmatore senior).  
> **Durata stimata**: 1 modulo da 12-15 minuti (oppure 2 lezioni da 7 minuti).  
> **Format**: Video con slide interattive + screencast pratico con dimostrazione dal vivo.

---

## 🎯 OBIETTIVO DEL MODULO
Insegnare all'allievo che l'Intelligenza Artificiale Generativa è uno straordinario moltiplicatore di velocità, ma se non guidata con le giuste istruzioni di sicurezza, genera codice apparentemente funzionante ma vulnerabile ad attacchi devastanti come la **SQL Injection (SQLi)** e la sottrazione di dati riservati.

---

## 🎬 PARTE 1: L'ILLUSIONE DEL VIBE CODING (Minuti 00:00 - 05:00)

### 1. Il Gancio Iniziale (Hook)
> *"Immagina di aver appena chiesto a ChatGPT o a Cursor di crearti una bellissima pagina di login per i tuoi clienti o un'automazione per salvare i contatti nel database. Funziona al primo colpo, sei entusiasta. Ma sapevi che con una semplice riga di testo qualsiasi sconosciuto da Internet potrebbe scaricare tutti i tuoi dati aziendali in 3 secondi senza nemmeno conoscere la password? Oggi scopriamo perché il codice dell'IA può diventare una trappola e come renderlo blindato al 100%."*

### 2. Chi è il "Vibe Coder" e perché è a rischio
* Il **Vibe Coder** è chi programma dialogando con l'IA: descrive cosa vuole e l'IA scrive il codice.
* **La trappola invisibile**: Gli LLM (ChatGPT, Claude, Gemini) sono ottimizzati per compiacere l'utente, cioè far funzionare il programma nel minor tempo possibile. Se non glielo chiedi esplicitamente, l'IA spesso salta le protezioni di sicurezza per mantenere il codice corto e semplice.

---

## 💥 PARTE 2: L'ATTACCO DAL VIVO (Minuti 05:00 - 08:30)

### Lo Scenario: Un tipico Form di Login scritto male dall'IA

Immagina un classico script backend generato da un prompt ingenuo (*"Fammi un login in Node.js che verifica utente e password sul database"*):

```javascript
// ❌ CODICE INSICURO GENERATO DALL'IA (Concatenazione di stringhe)
const query = "SELECT * FROM users WHERE username = '" + req.body.username + "' AND password = '" + req.body.password + "'";
const result = await db.query(query);

if (result.length > 0) {
  // Login riuscito!
  res.send("Benvenuto nel gestionale!");
}
```

### L'Attacco: La Chiave Universale (`' OR '1'='1`)

Cosa fa un attaccante quando vede questo form?
1. Nel campo **Username** non scrive un nome normale, ma digita:
   ```text
   admin' OR '1'='1
   ```
2. Guarda cosa diventa la query sul database quando il server incolla quella frase:
   ```sql
   SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = '...'
   ```
3. Poiché la condizione `'1'='1'` è **sempre vera**, il database ignora completamente il controllo della password e restituisce l'utente amministratore.
4. **Risultato**: L'attaccante entra nel sistema con pieni poteri senza conoscere la password!

---

## 🚫 IL FALSO MITO: "Basta togliere i punti e virgola e gli apici a mano"
Molti creator online consigliano di scrivere filtri casalinghi (es. *"se l'utente scrive un apice o una parentesi, cancellala"*).
* **Perché NON funziona**: Gli hacker esperti utilizzano codifiche alternative (URL encoding, commenti SQL come `--` o `/* */`, caratteri Unicode). I filtri manuali vengono quasi sempre aggirati.
* La sicurezza informatica moderna **non cerca di indovinare cosa c'è di cattivo nell'input**, ma cambia radicalmente il modo in cui il computer legge i dati.

---

## 🛡️ PARTE 3: I 3 PILASTRI PER BLINDARE IL CODICE (Minuti 08:30 - 13:00)

### Pilastro 1: Le Query Parametrizzate (Prepared Statements) & ORM
Invece di incollare le variabili dentro la frase SQL, separiamo rigorosamente il **comando** dal **dato**.

```javascript
// ✅ CODICE SICURO E BLINDATO (Prepared Statement)
const query = "SELECT * FROM users WHERE username = $1 AND password_hash = $2";
const result = await db.query(query, [req.body.username, hashedPassword]);
```
* **Come funziona**: Il database compila prima la struttura del comando (`$1`, `$2`). Quando arrivano i dati dell'utente, li tratta **esclusivamente come testo inerte**. Anche se l'utente scrive comandi SQL malevoli, il database li leggerà solo come un bizzarro cognome di lettere, rendendo l'attacco matematicamente impossibile.

### Pilastro 2: Usare Client Ufficiali e ORM (Supabase, Prisma, Drizzle)
Nei sistemi moderni (come Supabase che usiamo nella nostra Piattaforma), non scriviamo SQL grezzo:
```javascript
// ✅ IL NOSTRO STANDARD (Client Tipizzato Supabase)
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('username', req.body.username);
```
Il client gestisce la parametrizzazione in automatico: **zero rischio di iniezione**.

### Pilastro 3: Row Level Security (RLS) sul Database
Anche se un hacker riuscisse a rubare un token API pubblico dal frontend, se sul database è attiva la **Row Level Security (RLS)**:
* Il database controlla l'identità ad ogni singola riga:
  > *"Questo record appartiene all'azienda X. Chi fa la richiesta è dell'azienda Y? Accesso Negato."*
* La sicurezza non risiede nel codice fragile del browser, ma direttamente dentro il motore del database.

---

## 📋 IL PROMPT UNIVERSALE DI SICUREZZA (La Formula da Copiare)

Quando chiedi all'IA (ChatGPT, Claude, Cursor) di scrivere codice o API, non dire solo *"scrivimi lo script"*. Incolla sempre questo guardrail:

```text
Agisci come un Senior Security Engineer esperto in standard OWASP Top 10.

Compito:
Scrivi il codice backend per la gestione di [DESCRIVI IL COMPITO].

Vincoli Rigidi di Sicurezza:
1. Utilizza esclusivamente Prepared Statements (query parametrizzate) o il client ORM ufficiale (es. Supabase/Prisma). È severamente vietata qualsiasi concatenazione diretta di stringhe SQL.
2. Implementa la validazione a monte di tutti gli input utente tramite uno schema rigido (es. Zod).
3. Non restituire mai nei messaggi di errore i dettagli tecnici del database o stack trace che possano aiutare un attaccante.
4. Spiega in 3 punti secchi le contromisure di sicurezza adottate nel codice fornito.
```

---

## 🎓 ESERCIZIO PRATICO PER L'ALLIEVO (Takeaway)

1. Prendi un codice, un form o uno script che hai generato in passato con l'IA.
2. Incollalo nella chat dell'IA con questo prompt:
   > *"Esegui un Security Audit rigoroso su questo codice. Cerca vulnerabilità come SQL Injection, mancata validazione di input o esposizione di chiavi segrete, e riscrivilo applicando le best practice OWASP."*
3. Confronta le due versioni e nota dove l'IA precedente era stata troppo superficiale!

// ===============================================
// Autocom Terminal v1.0
// von Benjamin Koch – 2025
// Alles lokal, keine Daten werden gesendet!
// ===============================================

const output = document.getElementById('terminal-output');
const input = document.getElementById('terminal-input');
const prompt = document.getElementById('prompt');

let username = localStorage.getItem('username') || 'guest';
let userhost = localStorage.getItem('userhost') || 'localhost';
updatePrompt();

// Geschichte für Pfeiltaste hoch/runter
let history = [];
let historyIndex = -1;

// █████ LOKALE PORTALTAGE DATENBANK (2025 + 2026 + später erweiterbar) █████
const portalDays = {
    2025: ["2025-01-01", "2025-01-02", "2025-01-11", "2025-01-12", "2025-01-29", "2025-01-30",
        "2025-02-08", "2025-02-09", "2025-02-26", "2025-02-27",
        "2025-03-19", "2025-03-20", "2025-03-21", "2025-04-07", "2025-04-08", "2025-04-27", "2025-04-28",
        "2025-05-16", "2025-05-17", "2025-06-05", "2025-06-06", "2025-06-24", "2025-06-25",
        "2025-07-15", "2025-07-16", "2025-08-03", "2025-08-04", "2025-08-23", "2025-08-24",
        "2025-09-11", "2025-09-12", "2025-10-01", "2025-10-02", "2025-10-21", "2025-10-22", "2025-10-31",
        "2025-11-01", "2025-11-19", "2025-11-20", "2025-12-10", "2025-12-11", "2025-12-30", "2025-12-31"
    ],
    2026: ["2026-01-17", "2026-01-18", "2026-01-19", "2026-01-20", "2026-01-21", "2026-01-28", "2026-01-29",
        "2026-02-05", "2026-02-06", "2026-02-11", "2026-02-16", "2026-02-17", "2026-02-19", "2026-02-20", "2026-02-24", "2026-02-25",
        "2026-03-04", "2026-03-05", "2026-03-07", "2026-03-08", "2026-03-12", "2026-03-13", "2026-03-15", "2026-03-25", "2026-03-26", "2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30", "2026-03-31",
        "2026-04-01", "2026-04-02", "2026-04-03", "2026-05-04", "2026-05-05", "2026-05-06", "2026-05-07", "2026-05-08", "2026-05-09", "2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-23", "2026-05-24", "2026-05-26", "2026-05-27", "2026-05-31",
        "2026-06-01", "2026-06-03", "2026-06-04", "2026-06-11", "2026-06-12", "2026-06-16", "2026-06-17", "2026-06-19", "2026-06-20", "2026-06-24", "2026-06-25", "2026-06-30",
        "2026-07-01", "2026-07-07", "2026-07-08", "2026-07-15", "2026-07-16", "2026-07-19", "2026-07-20",
        "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-26", "2026-08-27",
        "2026-09-15", "2026-09-16", "2026-09-17",
        "2026-10-04", "2026-10-05", "2026-10-08", "2026-10-09", "2026-10-15", "2026-10-16", "2026-10-23", "2026-10-24", "2026-10-29", "2026-10-30",
        "2026-11-03", "2026-11-04", "2026-11-06", "2026-11-07", "2026-11-11", "2026-11-12", "2026-11-19", "2026-11-20", "2026-11-22", "2026-11-23", "2026-11-27", "2026-11-28", "2026-11-30",
        "2026-12-01", "2026-12-10", "2026-12-11", "2026-12-12", "2026-12-13", "2026-12-14", "2026-12-15", "2026-12-16", "2026-12-17", "2026-12-18", "2026-12-19"
    ]
};

// Alle verfügbaren Befehle
const commands = {
    '/info': () => 'Das Terminalprojekt von Benjamin Koch ist ein Übungsprojekt. Es werden keine Daten irgendwo gespeichert, alles im LocalStorage für maximale Privatsphäre.',

    '/version': () => 'Das Terminalprojekt ist nun in der Version 1.0 und hat inzwischen über 15 Befehle. Siehe /commands!',

    '/commands': () => {
        const list = Object.keys(commands).sort().join('<br>');
        return `<strong>Verfügbare Befehle:</strong><br>${list}<br><br>Tippe einen Befehl ein und drücke Enter.`;
    },

    '/h': () => '/help',
    '/help': () => 'Du kannst unter /commands alle Befehle dir anzeigen lassen. Viel Spaß beim Benutzen!',

    '/whoami': async() => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return `Deine öffentliche IP: <strong>${data.ip}</strong>`;
        } catch (e) { return 'IP konnte nicht abgefragt werden (keine Verbindung)'; }
    },

    '/wttr': async() => {
        const city = input.value.trim().slice(6).trim() || 'Seesen';
        const res = await fetch(`https://wttr.in/${city}?format=%l:+%c+%t+%w`);
        const text = await res.text();
        return text || 'Wetterdienst momentan nicht erreichbar';
    },

    '/moon': () => {
        const phases = ['Neumond', 'Erstes Viertel', 'Vollmond', 'Letztes Viertel'];
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        // Berechnung nach einfacher Formel (Conway)
        const y = year - Math.floor((14 - month) / 12);
        const m = month + 12 * Math.floor((14 - month) / 12) - 3;
        const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        const daysSinceNew = (jd - 2451550.1) % 29.530588853;
        const phaseIndex = Math.floor((daysSinceNew + 2) / 29.530588853 * 8) % 8;

        const emojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
        return `Aktuelle Mondphase: ${emojis[phaseIndex]} ${phases[Math.floor(phaseIndex/2)]} (${(daysSinceNew).toFixed(2)} Tage seit Neumond)`;
    },

    '/portal': async() => {
        // Wir nutzen eine externe JSON von einem bekannten Maya-Portal-Kalender
        try {
            const year = new Date().getFullYear();
            const res = await fetch(`https://raw.githubusercontent.com/mayakalender/portaltage/main/${year}.json`);
            const days = await res.json();
            const today = new Date().toISOString().slice(0, 10);
            const isPortal = days.includes(today);
            return isPortal ?
                '🌟 Ja! Heute ist ein <strong>Portaltag</strong>! 🌟' :
                'Nein, heute ist kein Portaltag. Nächster folgt bald.';
        } catch (e) {
            return 'Portaltage konnten nicht geladen werden (Fallback: externe JSON nicht erreichbar)';
        }
    },

    '/sunrise': () => getSunTimes('sunrise'),
    '/sundown': () => getSunTimes('sunset'),

    '/git': () => 'GitHub Repository: <a href="https://github.com/deinusername/autocom-terminal" target="_blank">https://github.com/deinusername/autocom-terminal</a> (Platzhalter – einfach anpassen)',

    '/new txt': () => {
        const text = prompt('Gib deinen Text ein:');
        if (text) {
            const notes = JSON.parse(localStorage.getItem('notes') || '[]');
            notes.push({ date: new Date().toLocaleString(), text });
            localStorage.setItem('notes', JSON.stringify(notes));
            return `Notiz gespeichert! (${notes.length} gesamt)`;
        }
        return 'Abgebrochen.';
    },

    '/time': () => new Date().toLocaleTimeString('de-DE'),
    '/date': () => new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),

    '/news': () => 'Neue Funktionen in v1.0:<br> • Exakte Mondphasenberechnung<br>• Portaltage (Maya-Kalender)<br>• Runen-Easteregg<br>• CRT-Monitor-Look<br>• Viele Bugfixes',

    '/clear': () => { output.innerHTML = ''; return ''; },

    '/export': () => {
        const data = {
            notes: localStorage.getItem('notes') || '[]',
            username: username,
            userhost: userhost
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'autocom-backup.json';
        a.click();
        return 'Backup wurde heruntergeladen!';
    },

    '/setusername': () => {
        const name = prompt('Neuer Username:', username);
        if (name && name.trim()) {
            username = name.trim();
            localStorage.setItem('username', username);
            updatePrompt();
            return `Username geändert zu: ${username}`;
        }
        return 'Abgebrochen.';
    },

    '/setuserhost': () => {
        const host = prompt('Neuer Host:', userhost);
        if (host && host.trim()) {
            userhost = host.trim();
            localStorage.setItem('userhost', host);
            updatePrompt();
            return `Host geändert zu: ${userhost}`;
        }
        return 'Abgebrochen.';
    },

    '/speak': () => {
        const text = input.value.slice(7).trim();
        if ('speechSynthesis' in window && text) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'de-DE';
            speechSynthesis.speak(utter);
            return `Lese vor: "${text}"`;
        }
        return 'Sprachausgabe nicht unterstützt oder kein Text.';
    },

    '/rune': () => {
        const runeMap = { a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ', i: 'ᛁ', j: 'ᛃ', k: 'ᚲ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', o: 'ᛟ', p: 'ᛈ', q: 'ᛜ', r: 'ᚱ', s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚡ', w: 'ᚹ', x: 'ᚷᛊ', y: 'ᛃ', z: 'ᛉ' };
        const text = input.value.slice(6).toLowerCase();
        let result = '';
        for (let char of text) {
            result += runeMap[char] || char;
        }
        return result;
    }
};

// Hilfsfunktion: Sonnenauf-/untergang Seesen
async function getSunTimes(type) {
    try {
        const res = await fetch('https://api.sunrise-sunset.org/json?lat=51.89&lng=10.18&formatted=0');
        const data = await res.json();
        const date = new Date(type === 'sunrise' ? data.results.sunrise : data.results.sunset);
        return `${type === 'sunrise' ? 'Sonnenaufgang' : 'Sonnenuntergang'} in Seesen: <strong>${date.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})} Uhr</strong>`;
    } catch (e) {
        return 'Sonnenzeiten konnten nicht geladen werden.';
    }
}

// Prompt aktualisieren
function updatePrompt() {
    prompt.textContent = `${username}@${userhost}:~$ `;
}

// Eingabe verarbeiten
input.addEventListener('keydown', async(e) => {
    if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd === '') { input.value = ''; return; }

        addLine(`${username}@${userhost}:~$ ${cmd}`);
        history.unshift(cmd);
        historyIndex = -1;

        let result = 'Befehl nicht gefunden. /help für Hilfe.';

        if (commands[cmd.split(' ')[0]]) {
            result = await commands[cmd.split(' ')[0]]();
        }

        if (result !== '') addLine(result);
        input.value = '';
        output.scrollTop = output.scrollHeight;
    }

    // Geschichte mit Pfeiltasten
    if (e.key === 'ArrowUp') {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            input.value = history[historyIndex];
        }
    }
    if (e.key === 'ArrowDown') {
        if (historyIndex > 0) {
            historyIndex--;
            input.value = history[historyIndex];
        } else if (historyIndex === 0) {
            historyIndex = -1;
            input.value = '';
        }
    }
});

// Zeile hinzufügen
function addLine(text) {
    const line = document.createElement('p');
    line.innerHTML = text;
    output.appendChild(line);
}

// Startnachricht
addLine('<span style="color:#00ffaa">Willkommen zum Autocom Terminal v1.0</span>');
addLine('Tippe /help oder /commands für eine Übersicht.');
addLine('─────────────────────────────────────────────');
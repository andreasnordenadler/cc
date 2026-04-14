#!/usr/bin/env python3
import json, subprocess, sys, time, pathlib, datetime

canonical = 'https://cc-andreas-nordenadlers-projects.vercel.app/account'
active = 'https://cc-taupe-kappa.vercel.app/account'
outdir = pathlib.Path(sys.argv[1])
username = sys.argv[2]
outdir.mkdir(parents=True, exist_ok=True)

JS_HELPER = r'''
(() => {
  function findInput(labelText) {
    const labels = Array.from(document.querySelectorAll('label, p, span, div'));
    const label = labels.find(el => el.textContent && el.textContent.trim() === labelText);
    if (label) {
      let cur = label;
      for (let i = 0; i < 6 && cur; i++, cur = cur.parentElement) {
        const input = cur.querySelector && cur.querySelector('input');
        if (input) return input;
      }
    }
    return Array.from(document.querySelectorAll('input')).find(el => {
      const attrs = [el.name, el.id, el.getAttribute('placeholder'), el.getAttribute('aria-label')].join(' ').toLowerCase();
      return attrs.includes('chess');
    }) || document.querySelectorAll('input')[1] || document.querySelector('input');
  }
  function findButton() {
    return Array.from(document.querySelectorAll('button')).find(el => /Update usernames/i.test(el.textContent || ''));
  }
  const input = findInput('Chess.com username');
  const button = findButton();
  return JSON.stringify({
    href: location.href,
    title: document.title,
    body: document.body ? document.body.innerText : '',
    chessValue: input ? input.value : '',
    buttonText: button ? button.innerText : ''
  });
})()
'''

FILL_JS = r'''
((value) => {
  function findInput(labelText) {
    const labels = Array.from(document.querySelectorAll('label, p, span, div'));
    const label = labels.find(el => el.textContent && el.textContent.trim() === labelText);
    if (label) {
      let cur = label;
      for (let i = 0; i < 6 && cur; i++, cur = cur.parentElement) {
        const input = cur.querySelector && cur.querySelector('input');
        if (input) return input;
      }
    }
    return Array.from(document.querySelectorAll('input')).find(el => {
      const attrs = [el.name, el.id, el.getAttribute('placeholder'), el.getAttribute('aria-label')].join(' ').toLowerCase();
      return attrs.includes('chess');
    }) || document.querySelectorAll('input')[1] || document.querySelector('input');
  }
  const input = findInput('Chess.com username');
  if (!input) return 'missing input';
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return input.value;
})(%s)
'''

CLICK_JS = r'''
(() => {
  const button = Array.from(document.querySelectorAll('button')).find(el => /Update usernames/i.test(el.textContent || ''));
  if (!button) return 'missing button';
  button.click();
  return button.innerText || 'clicked';
})()
'''

RELOAD_JS = 'location.assign(location.href); "reload"'


def run_applescript(script):
    proc = subprocess.run(['osascript', '-'], input=script, text=True, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip())
    return proc.stdout.strip()


def chrome_exec(tab_index, js):
    script = f'''
    tell application "Google Chrome"
      activate
      tell front window
        execute (tab {tab_index}) javascript {json.dumps(js)}
      end tell
    end tell
    '''
    return run_applescript(script)


def setup_window():
    script = f'''
    tell application "Google Chrome"
      activate
      set newWindow to make new window
      tell newWindow
        set URL of active tab to {json.dumps(canonical)}
        make new tab at end of tabs with properties {{URL:{json.dumps(active)}}}
        set active tab index to 1
      end tell
    end tell
    '''
    run_applescript(script)


def close_window():
    script = '''
    tell application "Google Chrome"
      if (count of windows) > 0 then close front window
    end tell
    '''
    run_applescript(script)


def capture(prefix, suffix):
    data = json.loads(chrome_exec(1 if prefix=='canonical' else 2, JS_HELPER))
    (outdir / f'{prefix}__account_url_{suffix}.txt').write_text(data['href'])
    (outdir / f'{prefix}__account_{suffix}.txt').write_text(data['body'])
    (outdir / f'{prefix}__chesscom_{suffix}_value.txt').write_text(data['chessValue'])
    (outdir / f'{prefix}__title_{suffix}.txt').write_text(data['title'])
    return data

setup_window()
try:
    time.sleep(8)
    (outdir / 'start_utc.txt').write_text(datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z'))
    before_c = capture('canonical', 'before')
    before_a = capture('active', 'before')
    (outdir / 'submitted_username.txt').write_text(username)

    for prefix, idx in [('canonical',1), ('active',2)]:
        filled = chrome_exec(idx, FILL_JS % json.dumps(username))
        (outdir / f'{prefix}__filled_value.txt').write_text(filled)
        result = chrome_exec(idx, CLICK_JS)
        (outdir / f'{prefix}__submit_result.txt').write_text(result)
        time.sleep(3)

    time.sleep(5)
    after_submit_c = capture('canonical', 'after_submit')
    after_submit_a = capture('active', 'after_submit')

    for idx in [1,2]:
        chrome_exec(idx, RELOAD_JS)
        time.sleep(1)
    time.sleep(10)
    after_reload_c = capture('canonical', 'after_reload')
    after_reload_a = capture('active', 'after_reload')
    (outdir / 'end_utc.txt').write_text(datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z'))

    summary = []
    for label, a, b in [
        ('before snapshots', before_c['body'], before_a['body']),
        ('after_submit snapshots', after_submit_c['body'], after_submit_a['body']),
        ('after_reload snapshots', after_reload_c['body'], after_reload_a['body']),
    ]:
        summary.append(f"{label}: {'byte-identical' if a == b else 'DIFFERENT'}")
    for key in ['before','after_submit','after_reload']:
        summary.append(f"canonical {key.replace('_',' ')} url: {(outdir / ('canonical__account_url_' + key + '.txt')).read_text()}")
        summary.append(f"active {key.replace('_',' ')} url: {(outdir / ('active__account_url_' + key + '.txt')).read_text()}")
    (outdir / 'verifier_summary.txt').write_text('\n'.join(summary) + '\n')
    print(outdir)
finally:
    close_window()

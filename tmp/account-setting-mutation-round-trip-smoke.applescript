on run argv
  set outDir to item 1 of argv
  set canonicalHost to "https://cc-andreas-nordenadlers-projects.vercel.app"
  set activeHost to "https://cc-taupe-kappa.vercel.app"
  set usernameValue to item 2 of argv

  tell application "Google Chrome"
    activate
    if (count of windows) = 0 then make new window
    set win to front window
    set workTab to make new tab at end of tabs of win with properties {URL:canonicalHost & "/account"}
    delay 3

    do shell script "mkdir -p " & quoted form of outDir
    do shell script "date -u +%Y-%m-%dT%H:%M:%SZ > " & quoted form of (outDir & "/start_utc.txt")
    do shell script "printf '%s\n' " & quoted form of usernameValue & " > " & quoted form of (outDir & "/submitted_username.txt")

    repeat with hostPair in {{"canonical", canonicalHost}, {"active", activeHost}}
      set hostName to item 1 of hostPair
      set hostBase to item 2 of hostPair
      set URL of workTab to hostBase & "/account"
      delay 3
      set currentUrl to execute workTab javascript "window.location.href"
      set beforeText to execute workTab javascript "document.body ? document.body.innerText : ''"
      set beforeFieldValue to execute workTab javascript "(() => { const input = [...document.querySelectorAll('input')].find(el => /chess\\.?com/i.test((el.name||'') + ' ' + (el.id||'') + ' ' + (el.placeholder||'') + ' ' + ((el.labels && el.labels[0]) ? el.labels[0].innerText : '') + ' ' + ((el.closest('label')) ? el.closest('label').innerText : '') + ' ' + (((el.parentElement||{}).innerText)||''))); return input ? input.value : 'missing-input'; })();"
      do shell script "printf '%s\n' " & quoted form of currentUrl & " > " & quoted form of (outDir & "/" & hostName & "__account_url_before.txt")
      do shell script "cat > " & quoted form of (outDir & "/" & hostName & "__account_before.txt") & " <<'EOF'\n" & beforeText & "\nEOF"
      do shell script "printf '%s\n' " & quoted form of beforeFieldValue & " > " & quoted form of (outDir & "/" & hostName & "__chesscom_before_value.txt")

      set fillResult to execute workTab javascript "(() => { const input = [...document.querySelectorAll('input')].find(el => /chess\\.?com/i.test((el.name||'') + ' ' + (el.id||'') + ' ' + (el.placeholder||'') + ' ' + ((el.labels && el.labels[0]) ? el.labels[0].innerText : '') + ' ' + ((el.closest('label')) ? el.closest('label').innerText : '') + ' ' + (((el.parentElement||{}).innerText)||''))); if (!input) return 'missing-input'; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(input, '" & usernameValue & "'); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); return input.value; })();"
      do shell script "printf '%s\n' " & quoted form of fillResult & " > " & quoted form of (outDir & "/" & hostName & "__filled_value.txt")
      delay 1

      set submitResult to execute workTab javascript "(() => { const btn = [...document.querySelectorAll('button')].find(b => /save|update|submit/i.test((b.innerText||'').trim())); if (!btn) return 'missing-submit'; btn.click(); return (btn.innerText||'').trim() || 'clicked'; })();"
      do shell script "printf '%s\n' " & quoted form of submitResult & " > " & quoted form of (outDir & "/" & hostName & "__submit_result.txt")
      delay 3

      set afterUrl to execute workTab javascript "window.location.href"
      set afterText to execute workTab javascript "document.body ? document.body.innerText : ''"
      set afterFieldValue to execute workTab javascript "(() => { const input = [...document.querySelectorAll('input')].find(el => /chess\\.?com/i.test((el.name||'') + ' ' + (el.id||'') + ' ' + (el.placeholder||'') + ' ' + ((el.labels && el.labels[0]) ? el.labels[0].innerText : '') + ' ' + ((el.closest('label')) ? el.closest('label').innerText : '') + ' ' + (((el.parentElement||{}).innerText)||''))); return input ? input.value : 'missing-input'; })();"
      do shell script "printf '%s\n' " & quoted form of afterUrl & " > " & quoted form of (outDir & "/" & hostName & "__account_url_after_submit.txt")
      do shell script "cat > " & quoted form of (outDir & "/" & hostName & "__account_after_submit.txt") & " <<'EOF'\n" & afterText & "\nEOF"
      do shell script "printf '%s\n' " & quoted form of afterFieldValue & " > " & quoted form of (outDir & "/" & hostName & "__chesscom_after_submit_value.txt")

      execute workTab javascript "window.location.reload()"
      delay 3

      set reloadUrl to execute workTab javascript "window.location.href"
      set reloadText to execute workTab javascript "document.body ? document.body.innerText : ''"
      set reloadFieldValue to execute workTab javascript "(() => { const input = [...document.querySelectorAll('input')].find(el => /chess\\.?com/i.test((el.name||'') + ' ' + (el.id||'') + ' ' + (el.placeholder||'') + ' ' + ((el.labels && el.labels[0]) ? el.labels[0].innerText : '') + ' ' + ((el.closest('label')) ? el.closest('label').innerText : '') + ' ' + (((el.parentElement||{}).innerText)||''))); return input ? input.value : 'missing-input'; })();"
      do shell script "printf '%s\n' " & quoted form of reloadUrl & " > " & quoted form of (outDir & "/" & hostName & "__account_url_after_reload.txt")
      do shell script "cat > " & quoted form of (outDir & "/" & hostName & "__account_after_reload.txt") & " <<'EOF'\n" & reloadText & "\nEOF"
      do shell script "printf '%s\n' " & quoted form of reloadFieldValue & " > " & quoted form of (outDir & "/" & hostName & "__chesscom_after_reload_value.txt")
    end repeat

    do shell script "date -u +%Y-%m-%dT%H:%M:%SZ > " & quoted form of (outDir & "/end_utc.txt")
  end tell
end run

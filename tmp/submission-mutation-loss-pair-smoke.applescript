on run argv
  set outDir to item 1 of argv
  set canonicalHost to "https://cc-andreas-nordenadlers-projects.vercel.app"
  set activeHost to "https://cc-taupe-kappa.vercel.app"
  set gameUrl to "https://www.chess.com/game/live/123456789"

  tell application "Google Chrome"
    activate
    if (count of windows) = 0 then make new window
    set win to front window
    set accountTab to make new tab at end of tabs of win with properties {URL:canonicalHost & "/account"}
    delay 1
    set listTab to make new tab at end of tabs of win with properties {URL:canonicalHost & "/challenges"}
    delay 1
    set workTab to make new tab at end of tabs of win with properties {URL:canonicalHost & "/challenges/lose-as-black"}
    delay 2

    set startEpoch to do shell script "date -u +%Y-%m-%dT%H:%M:%SZ > " & quoted form of (outDir & "/start_utc.txt")

    repeat with hostPair in {{"canonical", canonicalHost}, {"active", activeHost}}
      set hostName to item 1 of hostPair
      set hostBase to item 2 of hostPair
      repeat with routePair in {{"lose-as-black", "/challenges/lose-as-black"}, {"lose-as-white", "/challenges/lose-as-white"}}
        set routeName to item 1 of routePair
        set pathSuffix to item 2 of routePair
        set URL of workTab to hostBase & pathSuffix
        delay 2
        set beforeText to execute workTab javascript "document.body ? document.body.innerText : ''"
        do shell script "cat > " & quoted form of (outDir & "/" & hostName & "__" & routeName & "__before.txt") & " <<'EOF'\n" & beforeText & "\nEOF"
        execute workTab javascript "(() => { const btn = [...document.querySelectorAll('button')].find(b => /Start this challenge|Restart this challenge/i.test(b.innerText)); if (btn) btn.click(); return true; })();"
        delay 1
        execute workTab javascript "(() => { const input = document.querySelector('input[name=gameId], input[id=gameId], input'); if (!input) return 'missing-input'; input.focus(); input.value='" & gameUrl & "'; input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new Event('change',{bubbles:true})); return 'ok'; })();"
        delay 1
        execute workTab javascript "(() => { const btn = [...document.querySelectorAll('button')].find(b => /Submit for review/i.test(b.innerText)); if (!btn) return 'missing-submit'; btn.click(); return 'submitted'; })();"
        delay 2
        set afterText to execute workTab javascript "document.body ? document.body.innerText : ''"
        do shell script "cat > " & quoted form of (outDir & "/" & hostName & "__" & routeName & "__after.txt") & " <<'EOF'\n" & afterText & "\nEOF"
      end repeat
    end repeat

    set URL of accountTab to canonicalHost & "/account"
    delay 2
    set canonicalAccount to execute accountTab javascript "document.body ? document.body.innerText : ''"
    do shell script "cat > " & quoted form of (outDir & "/canonical__account.txt") & " <<'EOF'\n" & canonicalAccount & "\nEOF"
    set URL of accountTab to activeHost & "/account"
    delay 2
    set activeAccount to execute accountTab javascript "document.body ? document.body.innerText : ''"
    do shell script "cat > " & quoted form of (outDir & "/active__account.txt") & " <<'EOF'\n" & activeAccount & "\nEOF"

    set URL of listTab to canonicalHost & "/challenges"
    delay 2
    set canonicalList to execute listTab javascript "document.body ? document.body.innerText : ''"
    do shell script "cat > " & quoted form of (outDir & "/canonical__list.txt") & " <<'EOF'\n" & canonicalList & "\nEOF"
    set URL of listTab to activeHost & "/challenges"
    delay 2
    set activeList to execute listTab javascript "document.body ? document.body.innerText : ''"
    do shell script "cat > " & quoted form of (outDir & "/active__list.txt") & " <<'EOF'\n" & activeList & "\nEOF"

    do shell script "date -u +%Y-%m-%dT%H:%M:%SZ > " & quoted form of (outDir & "/end_utc.txt")
  end tell
end run

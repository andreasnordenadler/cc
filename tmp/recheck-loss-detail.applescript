on run argv
  set outDir to item 1 of argv
  set canonicalHost to "https://cc-andreas-nordenadlers-projects.vercel.app"
  set activeHost to "https://cc-taupe-kappa.vercel.app"
  tell application "Google Chrome"
    activate
    if (count of windows) = 0 then make new window
    set win to front window
    set workTab to make new tab at end of tabs of win with properties {URL:canonicalHost & "/challenges/lose-as-black"}
    delay 2
    repeat with hostPair in {{"canonical", canonicalHost}, {"active", activeHost}}
      set hostName to item 1 of hostPair
      set hostBase to item 2 of hostPair
      repeat with routePair in {{"lose-as-black", "/challenges/lose-as-black"}, {"lose-as-white", "/challenges/lose-as-white"}}
        set routeName to item 1 of routePair
        set pathSuffix to item 2 of routePair
        set URL of workTab to hostBase & pathSuffix
        delay 3
        set pageText to execute workTab javascript "document.body ? document.body.innerText : ''"
        do shell script "cat > " & quoted form of (outDir & "/" & hostName & "__" & routeName & "__recheck.txt") & " <<'EOF'\n" & pageText & "\nEOF"
      end repeat
    end repeat
  end tell
end run

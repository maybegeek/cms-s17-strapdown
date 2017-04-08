# cms-s17-strapdown

CMS &ndash; Blockkurs im Sommer 2017 zu Installation, Anpassung und Templating von Content-Management-Systemen.

Hier verwenden wir das Projekt [Strapdown.js (web)](http://strapdownjs.com/) / [Strapdown.js (github)](https://github.com/arturadib/strapdown) um mehr über kleine Javascript-Bibliotheken zur Inhaltsumwandlung zu erfahren. Hier bzgl. der Umwandlung eines Markdown formatierten Inhalts, sowie der Anpassung eines eigenen Templates/Themes.

## Anpassungen

Die Anpassungen lassen sich anhand der *commit messages* recht ordentlich nachvollziehen. Die kurze erste commit-Zeile kann ggfs. durch eine zusätzliche längere Erklärung ergänzt sein: [Commit Messages](https://github.com/maybegeek/cms-s17-strapdown/commits/master).

Einige Dateien wurden entfernt und aktualisiert, zusätzlich gab es Änderungen an der `strapdown.js`-Datei.

Darüberhinaus verwendete Projekte zur Fertigstellung:

* [Gridiculous](http://gridiculo.us/) (angepasst)
* [Normalize.css](https://necolas.github.io/normalize.css/)
* [marked](https://github.com/chjj/marked)
* ...

## Ziel

Eine angepasste Version von Strapdown.js, welche schnell Dokumente (Markdown formatiert) in einem angepassten Gewand als Webseite darstellt:

``` html
<!DOCTYPE html>
<html lang="de">
<meta charset="utf-8">
<meta name="author" content="Vorname Nachname">
<meta name="keywords" content="Begriff1, Begriff2, Begriff3">
<meta name="description" content="Beschreibung des Themas der Seite">
<title>Titel</title>
<xmp theme="ur">

# Markdown

Hier Markdown ... [angepasstes strapdwon](https://github.com/maybegeek/cms-s17-strapdown)

</xmp>
<script src="strapdown.js"></script>
<!-- oder so ... -->
<!--<script src="https://cdn.rawgit.com/maybegeek/cms-s17-strapdown/master/strapdown.js"></script>-->
</html>
```

## Demo

Von innerhalb des IP-Bereichs der UR ist die Seite hier zu sehen:

[strapdown.js, angepasst](https://homepages.ur.de/~pfc23283/CMS/strapdown/)

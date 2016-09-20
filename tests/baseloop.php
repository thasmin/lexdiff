<html>
<head>
<meta charset="utf-8">
<title>page title</title>
</head>
<body>
<!-- heading and list -->
<h1>heading</h1>
<ul>
<?php
// comment
foreach ($_GET as $k => $v) {
?>
	<li><?php echo $k ?>: <?php echo $v ?></li>
<?
	echo "<li>$k: $v</li>";
}
?>
</ul>
</body>
</html>
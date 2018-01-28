<?php
require_once('db_connect.php');

/* Getting file name */
$filename = $_FILES['file']['name'];

/* Get the datetime of the upload */

$query = "SELECT tags from barksy WHERE filename = '$filename'";
$result = mysql_query($query) or trigger_error("Barksy DB get tags failed!", E_USER_ERROR);
if (mysql_num_rows($result)) {
	$row = mysql_fetch_assoc($result);
	$tags = $row["tags"];
} else {
	$tags = "";
}

$arr = array("tags"=>$tags);

echo json_encode($arr);
?>
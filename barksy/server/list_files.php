<?php
require_once('db_connect.php');

$query = "SELECT filename, upload_date, tags FROM barksy ORDER BY upload_date";
$result = mysql_query($query) or trigger_error(mysql_error(), E_USER_ERROR);
while ($row = mysql_fetch_assoc($result)) {
    $arr[] = $row;
}

echo json_encode($arr);
?>
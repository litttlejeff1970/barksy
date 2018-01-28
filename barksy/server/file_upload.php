<?php
require_once('db_connect.php');

/* Getting file name */
$filename = $_FILES['file']['name'];

/* Location */
$location = '../uploads/';

/* Upload file */
move_uploaded_file($_FILES['file']['tmp_name'],$location.$filename);

/* Get the tags */
$tags = $_POST["tags"];

/* Record the file in the DB */

$query = "REPLACE INTO barksy(filename,tags) VALUES ('$filename','$tags')";
$result = mysql_query($query) or trigger_error(mysql_error(), E_USER_ERROR);

/* Get the datetime of the upload */

$query = "SELECT upload_date from barksy WHERE filename = '$filename'";
$result = mysql_query($query) or trigger_error("Barksy DB get upload_date failed!", E_USER_ERROR);
$row = mysql_fetch_assoc($result);
$upload_date = $row["upload_date"];

$arr = array("name"=>$filename, "tags"=>$tags, "uploadDate"=>$upload_date);
echo json_encode($arr);
?>
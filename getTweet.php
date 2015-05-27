<?php
include_once("connect.php");
header( "Content-Type:application/json" );
/**
 * This script returns the tweet(s) requested in a JSON format
 */

//Default city is 0
$movieId = isset($_GET["movie"]) ? $_GET["movie"] : -1;

//If not timestamp provided, gives last 5 tweets
if(isset($_GET["timestamp"])){
    $timestamp = $_GET["timestamp"];
    $request = $GLOBALS["bdd"]->prepare("SELECT * FROM tweets WHERE movieId=? AND timestamp>? LIMIT 5;");
    $request->execute(Array($movieId, $timestamp));
}else{
    $request = $GLOBALS["bdd"]->prepare("SELECT * FROM tweets WHERE movieId=? ORDER BY timestamp DESC LIMIT 10;");
    $request->execute(Array($movieId));
}

$result = Array();
while($data=$request->fetch(PDO::FETCH_ASSOC)){
    array_push($result, $data);
}

//If initial request, we reverse so that tweets are still in order
if(!isset($_GET["timestamp"])) $result = array_reverse($result);

echo json_encode($result);
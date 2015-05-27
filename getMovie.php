<?php
include_once("connect.php");
header( "Content-Type:application/json" );
/*
 * This script returns the movie requested info in a JSON format
 */

//Default id is 0
$movieId = isset($_GET["id"]) ? $_GET["id"] : 0;

$request = $GLOBALS["bdd"]->prepare(
    "SELECT movies.*, count(tweets.movieId) as count FROM movies, tweets WHERE movies.id=tweets.movieId AND movies.id=? GROUP BY movieId");
$request->execute(Array($movieId));

if($data=$request->fetch(PDO::FETCH_ASSOC)){
    echo json_encode($data);
}else{
    echo '{null}';
}


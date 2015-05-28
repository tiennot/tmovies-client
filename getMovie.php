<?php
include_once("connect.php");
header( "Content-Type:application/json" );
/*
 * This script returns the movie requested info in a JSON format
 */

//Default id is 0
$movieId = isset($_GET["id"]) ? $_GET["id"] : 0;
$topTweetOnly = isset($_GET["top"]) && $_GET["top"]=="true" ? true : false;

//JOIN LEFT ensures that even movies with no tweet will be returned
$request = $GLOBALS["bdd"]->prepare("
    SELECT movies.*, count(tweets.movieId) as count
    FROM movies
    LEFT JOIN tweets
    ON movies.id = tweets.movieId "
    .($topTweetOnly ? " AND tweets.top_tweet=true " : "").
    " WHERE movies.id=?
    GROUP BY movieId"
);
$request->execute(Array($movieId));

if($data=$request->fetch(PDO::FETCH_ASSOC)){
    echo json_encode($data);
}else{
    echo '{null}';
}


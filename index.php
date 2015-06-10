<?php
include_once("connect.php");
require("functions.php");
?>
<!doctype html>

<html lang="en">
    <head>
        <title>TMovies - Movies trends from Twitter</title>
        <!-- Meta -->
        <meta charset="utf-8">
        <meta name="description" content="TMovies, Movies trends from Twitter">
        <meta name="author" content="Camille TIENNOT">
        <!-- Style -->
        <link rel="stylesheet" href="style.css?v=1.0">
        <!-- External references -->
        <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300' rel='stylesheet' type='text/css'>
        <script type="text/javascript" src="jquery-2.1.4.js"></script>
        <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBUYhN1bL4npS4gFDo1ZL2YUfXew_RHRcY"></script>
    </head>

    <body>
        <script src="main.js"></script>

        <!-- The featured section -->
        <h1>
            Featured movies
        </h1>
        <div id="featured">
            <?php
            $nbFeatured = getConfigValue("nb_featured");
            ?>
            <div id="featured-container" style="width: <?php echo $nbFeatured*320+10 ?>px;">
                <?php
                $image_base_url = getConfigValue("image_base_url");
                //Passes the variable to script
                echo "<script>image_base_url='", $image_base_url, "'</script>";
                $request = $GLOBALS["bdd"]->query("SELECT id, poster_path as src, title FROM movies ORDER BY rel_pop DESC LIMIT ".$nbFeatured);
                $count = 0;
                while($data = $request->fetch(PDO::FETCH_ASSOC)){
                    ?>
                    <div class="movie" onclick="setMovie('<?php echo $data["id"] ?>')">
                        <div class="background" style="background-image: url(<?php echo $image_base_url, "w342", $data["src"] ?>)">
                        </div>
                        <span class="title">
                            <?php echo $data["title"] ?>
                        </span>
                    </div>
                    <?php
                    //Sets the view on load
                    if($count==0) echo "<script>window.addEventListener('load', function(){setMovie(", $data["id"], ")}, false)</script>";
                    $count++;
                }
                ?>
            </div>
        </div>

        <!-- Movie title -->
        <h1 id="movie-title"></h1>

        <div id="main">
            <!-- Rating box -->
            <div class="box" id="rating">
                <h3>Indicators for this movie (updated every hour)</h3>
                <div class="widget-container">
                    <div class="widget">
                        Popularity
                        <div class="pointer" id="pointer-1"></div>
                    </div>
                </div>
                <div class="widget-container">
                    <div class="widget">
                        Tweet Flow
                        <div class="pointer" id="pointer-2"></div>
                    </div>
                </div>
                <div class="widget-container">
                    <div class="widget">
                        Rating
                        <div class="pointer"  id="pointer-3"></div>
                    </div>
                </div>
            </div>
            <!-- The details column -->
            <div id="details">
                <!-- Allows to choose between relevant and live tweets-->
                <div class="box">
                    <h3>Display</h3>
                    <div class="toggler toggler-left" id="toggle-feed">
                        <a class="left" onclick="toggleDisplay(true)">Top</a>
                        <a class="right" onclick="toggleDisplay(false)">All</a>
                    </div>
                </div>
                <!-- Gives number of tweets recorded for this movie -->
                <div class="figure-box box">
                    <h3>Tweet count</h3>
                    <div class="figure" id="tweets-count">
                        <?php
                        $request = $GLOBALS["bdd"]->prepare("SELECT count(*) as nb FROM tweets WHERE timestamp > ?");
                        $request->execute(Array((time()-3600)*1000));
                        $data = $request->fetch(PDO::FETCH_ASSOC);
                        echo $data["nb"];
                        ?>
                    </div>
                </div>

                <!-- The poster -->
                <div class="box">
                    <img id="details-poster" src=""/>
                </div>

                <!-- Release date -->
                <div class="figure-box box">
                    <h3 id="details-release-title">Release date</h3>
                    <div class="figure" id="details-release-date">
                    </div>
                </div>

                <!-- The overview -->
                <div class="box">
                    <h3>Overview</h3>
                    <div id="details-overview">
                    </div>
                </div>

                <!-- Map of tweets locations -->
                <!--<div class="box" id="map">
                </div>-->

                <!-- "footer" -->
                <div id="footer" class="box">
                    Twitter real-time data are retrieved using the
                    <a href="https://dev.twitter.com/streaming/overview" target="_blank">
                        Twitter Streaming API
                    </a>
                    <br/>
                    Movie metadata and posters gratefully provided by
                    <a href="http://themoviedb.org" target="_blank">
                        The Movie Database
                    </a>
                </div>
            </div>

            <!-- The tweet feed with real-time updating-->
            <div id="feed">
                <div id="feed-tweets"></div>
                <div id="load-more-tweets" onclick="getMoreTweets()">
                    <a>See more</a>
                </div>
            </div>
        </div>
        <div class="loadingScreen" id="loading-screen">
            <img src="icons/loading.gif"/>
        </div>
    </body>
</html>
<?php
include_once("connect.php");

//Gets a given config parameter from bdd
function getConfigValue($key){
    $request = $GLOBALS["bdd"]->prepare("SELECT cvalue FROM config WHERE ckey=?");
    $request->execute(Array($key));
    $data = $request->fetch(PDO::FETCH_ASSOC);
    return $data["cvalue"];
}
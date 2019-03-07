<?php
//First check what kind of method we are (names, books, titles or places)
if(isset($_GET['m'])){
    $m = $_GET['m'];
    //Set the port number according to the mode
    if($m == 'n') $m = 85;
    else if($m == 'b') $m = 86;
    else if($m == 'p') $m = 88;
    else if($m == 't') $m = 89;
    else exit();

    //This file will echo the contents of a page onto this page (which will then be HTTPS).
    if(isset($_GET['id'])){//Only do something if the id parameter is set
        //Check if the id parameter is a number
        $id = $_GET['id'];
        if(is_numeric($id)){//Only continue with the work if the value is numeric
            echo file_get_contents("https://digerati.aks.ac.kr:$m/api/Values/$id" ); 
        }
    }else if(isset($_GET['q'])){//Only do a search if a q is set
        $q = $_GET['q'];
        echo file_get_contents("https://digerati.aks.ac.kr:$m/api/ChName?ChName=$q");
    }
}//Nothing happens if no method is set
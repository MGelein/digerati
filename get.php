<?php
//This file will echo the contents of a page onto this page (which will then be HTTPS).
if(isset($_GET['id'])){//Only do something if the id parameter is set
    //Check if the id parameter is a number
    $id = $_GET['id'];
    if(is_numeric($id)){//Only continue with the work if the value is numeric
        echo file_get_contents("http://digerati.aks.ac.kr:84/api/Values/$id" ); 
    }
}
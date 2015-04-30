<?php
/**
 * Created by PhpStorm.
 * User: kn
 * Date: 16/03/15
 * Time: 19:13
 */

session_start();
require_once 'MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded->function == 'checkLastLogin') {
    checkLastLogin($decoded->userid, $decoded->token);
}else if($decoded->function == 'logout'){
    logout($decoded->userid);
}else if($decoded->function == 'login'){
    logout($decoded->userid);
}

function logout($userid){
    $db = new MysqliDb();
    $db->rawQuery('update usuarios set token ="" where usuario_id =' . $userid);
    echo $db->getLastError();
}


function checkLastLogin($userid, $token)
{
    $db = new MysqliDb();
    $results = $db->rawQuery('select user_name, rol_id, TIME_TO_SEC(TIMEDIFF(now(), last_login)) diferencia
from usuarios where usuario_id = ' . $userid . ' and token= "' . $token . '"');


    if ($db->count < 1) {
        $db->rawQuery('update usuarios set token ="" where usuario_id =' . $userid);
        echo(json_encode(false));


    } else {

        $diff = $results[0]["diferencia"];

        if (intval($diff) < 12960) {
            echo(json_encode($results[0]));
        } else {
            $db->rawQuery('update usuarios set token ="" where usuario_id =' . $userid);
            echo(json_encode(false));

        }
    }

}



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

if ($decoded->function == 'login') {
    login($decoded->username, $decoded->password);
} else if ($decoded->function == 'checkLastLogin') {
    checkLastLogin($decoded->userid);
} else if ($decoded->function == 'create') {
    create($decoded->user);
} else if ($decoded->function == 'getUserByEmail') {
    getUserByEmail($decoded->email);
} else if ($decoded->function == 'resetPassword') {
    resetPassword($decoded->user, $decoded->new_password, $decoded->changepwd);
} else if ($decoded->function == 'getUserByEmailAndPassword') {
    getUserByEmailAndPassword($decoded->email, $decoded->password);
} else if ($decoded->function == 'ExisteUsuario') {
    ExisteUsuario($decoded->username);
}

function login($username, $password)
{
    $db = new MysqliDb();
    $db->where("user_name", $username);

    $results = $db->get("usuarios");

    $hash = $results[0]['password'];

    if (password_verify($password, $hash)) {
        $changepwd = $results[0]['changepwd'];
        if($changepwd == '1') {
            $response = ['response' => true, 'changepwd' => true, 'user' => json_encode($results[0])];
        }
        else {
            $userId = $results[0]['usuario_id'];
            $token = password_hash(rand(), PASSWORD_BCRYPT);
            $token = str_replace('/','',$token);
            $data = array('last_login' => $db->now(),
                'token' => $token);
            $db->where('usuario_id', $userId);

            $results[0]['token'] = $token;

            if ($db->update('usuarios', $data)) {
                $response = ['response' => true, 'user' => json_encode($results[0]), 'pwd' => $password, 'hash' => $hash, 'pwd_info' => password_get_info($hash)];
            } else {
                $response = ['response' => false, 'pwd' => $password, 'hash' => $hash, 'pwd_info' => password_get_info($hash)];
            }
        }
        echo json_encode($response);
    } else {
        $response = ['response' => false, 'pwd' => $password, 'hash' => $hash, 'pwd_info' => password_get_info($hash)];
        echo json_encode($response);
    }
}

function checkLastLogin($userid)
{
    $db = new MysqliDb();
    $results = $db->rawQuery('select TIME_TO_SEC(TIMEDIFF(now(), last_login)) diferencia from usuarios where usuario_id = ' . $userid);

    if ($db->count < 1) {
        $db->rawQuery('update usuarios set token ="" where usuario_id =' . $userid);
        echo(json_encode(false));
    }
    else {
        $diff = $results[0]["diferencia"];

        if (intval($diff) < 12960) {
            echo(json_encode($results[0]));
        } else {
            $db->rawQuery('update usuarios set token ="" where usuario_id =' . $userid);
            echo(json_encode(false));
        }
    }
}


function create($user)
{
    $db = new MysqliDb();
    $user_decoded = json_decode($user);
    $options = ['cost' => 12];
    $password = password_hash($user_decoded->password, PASSWORD_BCRYPT, $options);

    $data = array(
        'nombre' => $user_decoded->nombre,
        'apellido' => $user_decoded->apellido,
        'user_name' => $user_decoded->username,
        'password' => $password);

    $result = $db->insert('usuarios', $data);
    if ($result > -1) {
        echo json_encode(true);
    } else {
        echo json_encode(false);
    }
}

/**
 * esta funcion me retorna un usuario filtrando x email
 * @param $email
 */
function getUserByEmail($email)
{
    //Instancio la conexion con la DB
    $db = new MysqliDb();
    //Armo el filtro por email
    $db->where("email", $email);
    //Que me retorne el usuario filtrando por email
    $results = $db->get("usuarios");

    //Serializo el resultado
    $response = ['user' => json_encode($results[0])];

    //retorno el resultado serializado
    echo json_encode($response);
}

function resetPassword($user, $new_password, $changepwd)
{
    $db = new MysqliDb();
    $user_decoded = json_decode($user);
    $options = ['cost' => 12];
    $password = password_hash($new_password, PASSWORD_BCRYPT, $options);

    $data = array('password' => $password,
        'changepwd' => $changepwd);

    $db->where('usuario_id', $user_decoded->usuario_id);
    if ($db->update('usuarios', $data)) {
        echo json_encode(['result' => true, 'new_password' => $new_password, 'password_hashed' => $password, 'pwd_info' => password_get_info($password)]);
    } else {
        echo json_encode(['result' => false, 'new_password' => $new_password, 'password_hashed' => $password, 'pwd_info' => password_get_info($password)]);
    }
}

function getUserByEmailAndPassword($email, $password)
{
    //Instancio la conexion con la DB
    $db = new MysqliDb();
    //Armo el filtro por email
    $db->where("email", $email);
    //Que me retorne el usuario filtrando por email
    $results = $db->get("usuarios");

    $hash = $results[0]['password'];

    if (password_verify($password, $hash)) {
        $response = ['user' => json_encode($results[0]), 'result' => true, 'password' => $password, 'hash' => $hash, 'pwd_info' => password_get_info($hash)];
    }
    else {
        $response = ['user' => json_encode(null), 'result' => false, 'password' => $password, 'hash' => $hash, 'pwd_info' => password_get_info($hash)];
    }
    //retorno el resultado serializado
    echo json_encode($response);
}

function ExisteUsuario($username)
{
    //Instancio la conexion con la DB
    $db = new MysqliDb();
    $db->where("user_name", $username);
    //Que me retorne el usuario filtrando por email
    $results = $db->get("usuarios");

    if($results != null) {
        $response = ['noExiste' => true];
    }
    else {
        $response = ['noExiste' => false];
    }
    //retorno el resultado serializado
    echo json_encode($response);
}
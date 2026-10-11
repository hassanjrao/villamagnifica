<?php




if(isset($_POST['contactFrmSubmit']) && 



!empty($_POST['fname']) && 

!empty($_POST['lname']) && 

!empty($_POST['email']) && (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) === false) && 

!empty($_POST['about']) &&

!empty($_POST['occasion']) &&

!empty($_POST['fdate']) &&

!empty($_POST['ldate']) &&

!empty($_POST['people']) &&

!empty($_POST['hearabout']) &&

!empty($_POST['message']) 



)



{

    

    // Submitted form data

    $fname   = $_POST['fname'];

    $lname  = $_POST['lname'];

    $email  = $_POST['email'];

    $about  = $_POST['about'];

    $occasion  = $_POST['occasion'];

    $fdate  = $_POST['fdate'];

    $ldate  = $_POST['ldate'];

    $people  = $_POST['people'];

    $hearabout  = $_POST['hearabout'];

    $message   = $_POST['message'];



    

    /*

     * Send email to admin

     */

	$to     = 'alexlluch3@gmail.com';
	//$to     = 'kevin.labarre@infidati.com';

	//$to     = 'frontend.amzufia@gmail.com';

    $subject= 'Book Now Request Submitted';

    

    $htmlContent = '

    <h4>Contact request has submitted at Villa Magnfica, details are given below.</h4>

    <table cellspacing="0" style="width: 300px; height: 200px;">

        <tr>

            <th>First Name:</th><td>'.$fname.'</td>

        </tr>

        <tr>

            <th>Last Name:</th><td>'.$lname.'</td>

        </tr>



        <tr style="background-color: #e0e0e0;">

            <th>Email:</th><td>'.$email.'</td>

        </tr>



        <tr>

            <th>About you:</th><td>'.$about.'</td>

        </tr>

        <tr>

            <th>About the occasion:</th><td>'.$occasion.'</td>

        </tr>

        <tr>

            <th>Start Date:</th><td>'.$fdate.'</td>

        </tr>

        <tr>

            <th>End Date:</th><td>'.$ldate.'</td>

        </tr>

        <tr>

            <th>People:</th><td>'.$people.'</td>

        </tr>

        <tr>

            <th>Hear about Villa :</th><td>'.$hearabout.'</td>

        </tr>


        <tr>

            <th>Message:</th><td>'.$message.'</td>

        </tr>





		

    </table>';

    

    // Set content-type header for sending HTML email

    $headers = "MIME-Version: 1.0" . "\r\n";


    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

    

    // Additional headers

	

    //$headers .= 'From: Villa Magnfica<'.$email.'>' . "\r\n";

    
	if($hearabout == 'Lake Oak Meadows' || $hearabout == 'Vitaglianno Winery')
	{
		$headers .= 'Cc: anthony@lakeoakmeadows.com' . "\r\n";
	}
	

    // Send email

    if(mail($to,$subject,$htmlContent,$headers)){

        $status = 'ok';

    }else{

        $status = 'err';

    }

    

    // Output status

    echo $status;die;

}





?>

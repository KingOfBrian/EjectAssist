'use strict';

;( function ( document, window, index )
   {
       // feature detection for drag&drop upload
       var isAdvancedUpload = function() {
	   var div = document.createElement( 'div' );
	   return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
       }();
       
       // applying the effect for every form
       var forms = document.querySelectorAll( '.box' );
       Array.prototype.forEach.call( forms, function( form ) {
           
	   var input		 = form.querySelector( 'input[type="file"]' ),
	       label		 = form.querySelector( 'label' ),
	       errorMsg	         = form.querySelector( '.box__error' ),
	       successDiv        = document.querySelector( '.result' ),
               restart		 = form.querySelectorAll( '.box__restart' ),
               droppedFile = false,
	       updateFiles = function( files) {
		   if( files.count > 1 ) {
		       alert( "Can only generate one xib file at a time" )
		   }
		   else {
		       droppedFile = files[0]
		       label.textContent = droppedFile.name;
   		       var event = document.createEvent( 'HTMLEvents' );
		       event.initEvent( 'submit', true, false );
		       form.dispatchEvent( event );
		   }
		   return files.count == 1
               };
	   
           // letting the server side to know we are going to make an Ajax request
           var ajaxFlag = document.createElement( 'input' );
           ajaxFlag.setAttribute( 'type', 'hidden' );
           ajaxFlag.setAttribute( 'name', 'ajax' );
           ajaxFlag.setAttribute( 'value', 1 );
           form.appendChild( ajaxFlag );
	   
           // automatically submit the form on file select
           input.addEventListener( 'change', function( e ) {
               updateFiles( e.target.files )
           });
	   
           // drag&drop files if the feature is available
           if( isAdvancedUpload ) {
               form.classList.add( 'has-advanced-upload' ); // letting the CSS part to know drag&drop is supported by the browser
	       
               [ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event ) {
                   form.addEventListener( event, function( e ) {
                       // preventing the unwanted behaviours
                       e.preventDefault();
                       e.stopPropagation();
                   });
               });
               [ 'dragover', 'dragenter' ].forEach( function( event ) {
                   form.addEventListener( event, function() {
                       form.classList.add( 'is-dragover' );
                   });
               });
               [ 'dragleave', 'dragend', 'drop' ].forEach( function( event ) {
                   form.addEventListener( event, function() {
                       form.classList.remove( 'is-dragover' );
                   });
               });
               form.addEventListener( 'drop', function( e ) {
		   updateFiles( e.dataTransfer.files )
               });
           }
           
           
           // if the form was submitted
           form.addEventListener( 'submit', function( e ) {
               // preventing the duplicate submissions if the current one is in progress
               if( form.classList.contains( 'is-uploading' ) ) return false;
               
               form.classList.add( 'is-uploading' );
               form.classList.remove( 'is-error' );
               
               if( isAdvancedUpload ) // ajax file upload for modern browsers
               {
                   e.preventDefault();

                   // gathering the form data
                   var ajaxData = new FormData( form );
                   if( droppedFile ) {
		       ajaxData.delete( input.getAttribute( 'name' ) );
                       ajaxData.append( input.getAttribute( 'name' ), droppedFile );
                   }

                   // ajax request
                   var ajax = new XMLHttpRequest();
                   ajax.open( form.getAttribute( 'method' ), form.getAttribute( 'action' ), true );
                   
                   ajax.onload = function() {
                       form.classList.remove( 'is-uploading' );
                       if( ajax.status >= 200 && ajax.status < 400 ) {
			   successDiv.innerHTML = ajax.responseText;
			   form.parentNode.removeChild(form)
                       }
                       else {
			   errorMsg.textContent = "There was an error. Please log an i"
			   form.classList.add( 'is-error' );
		       }
                   };
                   
                   ajax.onerror = function() {
                       form.classList.remove( 'is-uploading' );
		       form.classList.add( 'is-error' );
		       errorMsg.textContent = "There was an error." 
                   };
                   
                   ajax.send( ajaxData );
               }
               else {
		   alert( 'Sorry, this browser is not supported' );
               }
           });
           
           
           // restart the form if has a state of error/success
           Array.prototype.forEach.call( restart, function( entry ) {
               entry.addEventListener( 'click', function( e ) {
                   e.preventDefault();
                   form.classList.remove( 'is-error', 'is-success' );
                   input.click();
               });
           });
           
           // Firefox focus bug fix for file input
           input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
           input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
       });
  }( document, window, 0 ));

//  
//  Copyright (c) 2016 Philipp Paulweber
//  All rights reserved.
//  
//  Developed by: Philipp Paulweber
//                https://github.com/ppaulweber/gilapv
//  
//  Permission is hereby granted, free of charge, to any person obtaining a 
//  copy of this software and associated documentation files (the "Software"), 
//  to deal with the Software without restriction, including without limitation 
//  the rights to use, copy, modify, merge, publish, distribute, sublicense, 
//  and/or sell copies of the Software, and to permit persons to whom the 
//  Software is furnished to do so, subject to the following conditions:
//  
//  * Redistributions of source code must retain the above copyright 
//    notice, this list of conditions and the following disclaimers.
//  
//  * Redistributions in binary form must reproduce the above copyright 
//    notice, this list of conditions and the following disclaimers in the 
//    documentation and/or other materials provided with the distribution.
//  
//  * Neither the names of the copyright holders, nor the names of its 
//    contributors may be used to endorse or promote products derived from 
//    this Software without specific prior written permission.
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
//  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
//  CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
//  WITH THE SOFTWARE.
//  

function main()
{    
    var error = 0;
    if( !window.jQuery ) 
    {
	console.log( 'gilapv: error: could not find jQuery!' );
	error = error + 1;
    }
    
    if(typeof( $.fn.popover ) == 'undefined')
    {
	console.log( 'gilapv: error: could not find Bootstrap!' );
	error = error + 1;
    }
    
    if( typeof( PDFJS ) == 'undefined' )
    {
	console.log( 'gilapv: error: could not find PDF.js!' );
	error = error + 1;
    }

    // if( typeof( angular ) == 'undefined' )
    // {
    // 	console.log( 'gilapv: error: could not find angular.js!' );
    // 	error = error + 1;
    // }
    
    if( error > 0 )
    {
	return;
    }
    
    var file_title  = $('.file-title');
    if( file_title[0] == null )
    {
	console.log( 'gilapv: error: could not find "file-title" element!' );
	return;
    }
    var file_actions  = $('.file-actions');
    if( file_actions[0] == null )
    {
	console.log( 'gilapv: error: could not find "file-actions" element!' );
	return;
    }
    var file_holder = $('.file-holder');
    if( file_holder[0] == null )
    {
	console.log( 'gilapv: error: could not find "file-holder" element!' );
	return;
    }
    var breadcrumb = $('.breadcrumb');
    if( breadcrumb[0] == null )
    {
	console.log( 'gilapv: error: could not find "breadcrumb" element!' );
	return;
    }
    
    var file_tree = breadcrumb.find('a:first').attr('href');
    var file_path = breadcrumb.find('a:last').attr('href');
    
    
    // TODO: FIXME: PPA: improve this with file_tree checks!
    var file_url  = window.location.origin + file_path.replace( '/blob/', '/raw/' ); 
    // console.log( file_url );
    
    file_actions.prepend
    ( $( '<div>'
      , { id    : 'gilapv-actions'
	, class : 'btn-group' 
	, style : 'margin-right: 20px;' 
	} 
      ) 
    );
    
    file_title.after
    ( $( '<div>'
      , { id    : 'gilapv-file-actions-xs'
	, class : 'file-title visible-xs'
	, style : 'text-align: right; direction: rtl;'
	} 
      ) 
    );
    
    file_holder.append
    ( $( '<div>'
      , { id : 'gilapv' 
	} 
      )
    );
    
    
    var file_code = $('.file-content.code');
    if( file_code[0] != null )
    {
	if( file_url.substr(-4) == ".svg" ) 
	{	
	file_code.hide();
        	
	$('#gilapv').append
	( $('<div>', { id : 'gilapv-svg-viewer', style : 'text-align: center;' }).append
	  (
	      $('<div>', { id : 'gilapv-svg', style : '' })
	  )
	);
	
	// var r = new Raphael(document.getElementById('...'), 500, 500);	
	// r.circle(200, 200, 80).attr({stroke: 'red', "stroke-width" : 3});
	
	var svg_width  = -1;
	var svg_height = -1;
	var svg_ratio  = -1;
	
	function svg_refresh()
	{
	    if( svg_ratio < 0 ) return;

	    var width = $('#gilapv-svg').width() - 4;
	    
	    $('#gilapv-svg-file'
	    ).css
	    ( 'width',  (width) + 'px' 
	    ).css
	    ( 'height', (width * svg_ratio) + 'px' 
	    );
	}
	
	$('#gilapv-svg').load
	( file_url
	, function()
	  {
	      $('#gilapv-svg').find( 'svg' ).attr('id','gilapv-svg-file');
	      
	      svg        = $('#gilapv-svg-file');
	      svg_width  = svg.width();
	      svg_height = svg.height();
	      svg_ratio  = svg_height * 1.0 / svg_width;
	      
	      $('svg').each
	      ( function() 
		{ 
		    $(this)[0].setAttribute( 'viewBox', '0 0 ' + svg_width + ' ' + svg_height ); 
		}
	      );
	      
	      svg_refresh();
	  } 
	);

	$(window).resize
	( function()
	  {
	      clearTimeout( window.resizedFinished );
	      window.resizedFinished = setTimeout
	      ( function()
		{
		    svg_refresh();
		}
		, 125
	      );
	  }
	);
        
        }
    }
    
    var file_blob = $('.file-content.blob_file.blob-no-preview');
    if( file_blob[0] != null )
    {
	if( file_url.substr(-4) == ".pdf" ) 
	{
	file_blob.hide();
	    
	var selected_page = 1;
	var pages = new Array();
	var first = true;
	var scale_mode = 'width';
	var fullscreen_state = false;
	var pdf_ratio = -1;
	
	$( '#gilapv' ).append
	( $( '<div>'
	  , { id    : 'gilapv-pdf'
	    , style : 'text-align: center;' 
	    }
	  ).append
	  (
	      $( '<div>'
              , { id    : 'gilapv-pdf-viewer'
		}
	      )
	  )
	).append
	( $( '<div>'
          , { id    : 'gilapv-pdf-modal'
	    , class : 'modal modal-fullscreen fade'
	    , style : 'text-align: center;'
	    }
	  )
	);
	
	
	$('#gilapv-actions'
	).append
	( $( '<a>'
	  , { id    : 'gilapv-action-pdf-prev'
	    , class : 'btn btn-sm fa fa-arrow-circle-left'
	    }
	  ).attr
	  ( 'data-toggle',    'tooltip' 
	  ).attr
	  ( 'title',          'Previous Page' 
	  ).click
	  ( function()
	    {
		if( selected_page > 1 )
		{
		    selected_page = selected_page - 1;
		}
		pdf_refresh();
	    }
	  )
	).append
	( $( '<a>'
	  , { id    : 'gilapv-action-pdf-next'
	    , class : 'btn btn-sm fa fa-arrow-circle-right'
	    }
	  ).attr
	  ( 'data-toggle', 'tooltip' 
	  ).attr
	  ( 'title',       'Next Page' 
	  ).click
	  ( function()
	    {
		if( selected_page < pages.length )
		{
		    selected_page = selected_page + 1;
		}
		pdf_refresh();
	    }
	  )
	).append
	( $( '<input>'
	  , { id    : 'gilapv-action-pdf-current'
	    , class : 'btn btn-sm input-sm'
	    , type  : 'number'
	    , value : '1'
	    }
	  ).attr
	  ( 'data-toggle', 'tooltip' 
	  ).attr
	  ( 'title',       'Page 1 of ...' 
	  ).attr
	  ( 'min',         '1' 
	  ).attr
	  ( 'max',         '1' 
	  ).on
	  ( 'input'
	  , function( e )
	    {
		selected_page = parseInt( $('#gilapv-action-pdf-current').val() ) || -1;
		if( selected_page == -1 )
		{
		    return;
		}
		if( selected_page > pages.length )
		{
		    selected_page = pages.length;
		}
		else if( selected_page < 1 )
		{
		    selected_page = 1;
		}
		pdf_refresh();
	    } 
	  )
	).append
	( $( '<a>'
	  , { id    : 'gilapv-action-pdf-fit'
	    , class : 'btn btn-sm fa fa-arrows-alt'
	    }
	  ).attr
	  ( 'data-toggle',    'tooltip' 
	  ).attr
	  ( 'title',          'Fit Width/Height' 
	  ).click
	  ( function()
	    {
		scale_mode = ( scale_mode == 'width' ? 'height' : 'width' );
		pdf_refresh();
	    }
	  )
	).append
	( $( '<a>'
	  , { id    : 'gilapv-action-pdf-fullscreen'
	    , class : 'btn btn-sm fa fa-expand'
	    }
	  ).attr
	  ( 'data-toggle',    'tooltip' 
	  ).attr
	  ( 'title',          'Presenation Mode' 
	  ).click
	  ( function()
	    {
		fullscreen_handler('show');
	    }
	  )
	);
	

	$('#gilapv-action-pdf-current').width( $('#gilapv-action-pdf-next').width() * 3 );
	
	function renderPage( page, num ) 
	{
	    var canvas_id = 'gilapv-pdf-page'; // + num + '-page';
	    var tlayer_id = 'gilapv-pdf-text'; // + num + '-text';
            
	    var bound  = 0;
	    var actual = 0;
	    var scale = 0.1;
	    var viewport = page.getViewport(scale);;
	    
	    if( pdf_ratio < 0 )
	    {
		pdf_ratio = viewport.height * 1.0 / viewport.width;
		scale_mode = ( pdf_ratio >= 1 ?  'width' : 'height' );
	    }
	    
	    if( !fullscreen_state )
	    {
		bound  
		    = (scale_mode == 'width') 
		    ? file_title.width()     
		    : ( $('.nicescroll').height() - file_title.offset().top ) - 55;
	    }
	    else
	    {
		bound  
		    = (scale_mode == 'width') 
		    ? window.screen.availWidth     
		    : window.screen.availHeight;
	    }
	    
	    while( actual <= bound )
	    {
		scale    = scale + 0.0005;
		viewport = page.getViewport(scale);
		actual   = (scale_mode == 'width') ? viewport.width : viewport.height;
	    }
	    viewport = page.getViewport(scale - (2*0.0005));
            
    	    var canvas = document.createElement('canvas');
    	    var ctx = canvas.getContext('2d');
	    
    	    var renderContext = 
	    { canvasContext: ctx
	    , viewport: viewport
	    };
	    
	    canvas.setAttribute( 'id', canvas_id );
	    canvas.height = viewport.height;
    	    canvas.width  = viewport.width;
        
	    if( first )
	    {
		$('#gilapv-pdf-viewer'
		).append
		( canvas
		).append
		( $('<div>', { id : tlayer_id, class : 'textLayer' })
		);
            }
	    else
	    {
		$( '#' + canvas_id ).replaceWith( canvas );
		$( '#' + tlayer_id ).empty();
	    }
            
	    temp = $('#' + canvas_id);
	    
            var offset = $( '#' + canvas_id ).offset();
            var $textLayerDiv = $( '#' + tlayer_id  
	    ).css
            ( { height : viewport.height+'px'
	      , width  : viewport.width+'px'
	      , top    : offset.top
	      , left   : offset.left
              }
            );
            
            page.render(renderContext);
            
            page.getTextContent().then
            ( function( text )
              {
		  var textLayer = new TextLayerBuilder
		  ( { textLayerDiv : $textLayerDiv.get(0)
                    , pageIndex : num
                    , viewport : viewport
                    }
		  );

		  textLayer.setTextContent( text );
		  textLayer.render();
              }
            );
	}

	function pdf_refresh()
	{
	    $('#gilapv-action-pdf-current'
	    ).val
	    ( selected_page 
	    ).attr
	    ( 'data-original-title', 'Page ' + selected_page + ' of ' + pages.length 
	    );
	    
            renderPage( pages[selected_page-1], selected_page-1 );        
	    
            return;

            // for(num = 0; num < pages.length; num++) 
	    // {
	    // 	renderPage( pages[num], num );
	    // }
	}
	
	first = true;
	PDFJS.disableWorker = true;
	PDFJS.getDocument( file_url ).then
	( function getPdf(pdf) 
	  {
              var percent = 0.0;
              
    	      for(num = 1; num <= pdf.numPages; num++) 
    	      {
    		  pdf.getPage(num).then
    		  ( function processPage(page)
		    {
			pages.push( page );
			
			if( pages.length == pdf.numPages )
			{
                            $( '#gilapv-action-pdf-current' ).attr( 'max', pages.length );
                            pdf_refresh();
			    first = false;
			}
		    }
    		  );
    	      }
	  }
	);
	
	
	$(document
	).on
	( 'webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange'
	, fullscreen_handler 
	);
	
	var fullscreen_last_status = false;
	function fullscreen_handler( action )
	{
            var status = window.screenTop == 0 && window.screenY == 0;
            
            function fullscreen_mode( flag )
            {
		var fullscreen_enter_function
		    =  document.body.requestFullScreen
		    || document.body.webkitRequestFullScreen
		    || document.body.mozRequestFullScreen
		    || document.body.msRequestFullScreen
		;

		var fullscreen_exit_function
		    =  document.cancelFullScreen
		    || document.webkitCancelFullScreen
		    || document.mozCancelFullScreen
		    || document.msCancelFullScreen
		;
		
		if( flag && fullscreen_enter_function )
		{
                    fullscreen_enter_function.call( document.body );                
		}
		if( !flag && fullscreen_exit_function )
		{
                    fullscreen_exit_function.call( document );                
		}

		if( flag )
		{
		    scale_mode = ( pdf_ratio >= 1 ? 'height' : 'width' );
		}
		else
		{
		    pdf_ratio = -1;
		}
            }
	    
            if( typeof( action ) == "object" )
            {
		if( status == false && fullscreen_last_status == false )
		{
		    fullscreen_state = false;
		    
		    $('#gilapv-pdf-modal').modal( 'hide' );
		    $('#gilapv-pdf-viewer').append( $('#gilapv-pdf-page') );
		    $('#gilapv-pdf-viewer').append( $('#gilapv-pdf-text') );
		}
            }
            else if( action == 'show' )
            {
		fullscreen_state = true;

		$('#gilapv-pdf-modal').modal( 'show' );
		$('#gilapv-pdf-modal').append( $('#gilapv-pdf-page') );
		$('#gilapv-pdf-modal').append( $('#gilapv-pdf-text') );
		
		fullscreen_mode( true );            
            }
            else if( action == 'hide' )
            {
		fullscreen_state = false;
		
		fullscreen_mode( false );
            }

            fullscreen_handler_last_status = status;
	}
	$('#gilapv-pdf-modal'
	).on
	( 'show.bs.modal'
	  , function()
	  {
              fullscreen_handler( true );
	  }
	).on
	( 'hide.bs.modal'
	  , function()
	  {
              fullscreen_handler( 'hide' );
	  }
	);
	
	
	
	$(window).resize
	( function()
	  {
	      clearTimeout( window.resizedFinished );
	      window.resizedFinished = setTimeout
	      ( function()
		{
		    pdf_refresh();
		}
		, 125
	      );
	  }
	);
        
        }
    }
    
    $('#gilapv-actions'
    ).append
    ( $( '<a>'
      , { id    : 'gilapv-action-download'
	, class : 'btn btn-sm fa fa-download'
	, href  : file_url
	}
      ).attr
      ( 'download', 'file' 
      ).attr
      ( 'data-toggle',    'tooltip' 
      ).attr
      ( 'title',          'Download File' 
      )
    ).append
    ( $( '<a>'
      , { id    : 'gilapv-action-info'
	, class : 'btn btn-sm btn-info fa fa-info-circle'
	}
      ).attr
      ( 'data-toggle',    'popover' 
      ).attr
      ( 'data-placement', 'bottom' 
      ).attr
      ( 'title',          'Plugin Information' 
      ).attr
      ( 'data-content',   'unable to load' 
      )
    );
    
    var $tool_info_data = $( '<div>', { id : 'gilapv-action-info-data' } );
    $.getJSON
    ( "https://api.github.com/repos/ppaulweber/gilapv"
    , function( json_repo ) 
      {
	  $.getJSON
	  ( "https://api.github.com/repos/ppaulweber/gilapv/branches/master"
	  , function( json_branch ) 
	    {
		$tool_info_data.append
		( $('<div>').html( $('<b>').html( json_repo.description )) 
		).append
		( $('<br>')
		).append
		( $('<div>', { class : 'row' } )
		  .append
		  ( $('<div>', { class : 'col-sm-12' } ).html( 'Revision:' )
		  )
		).append
		( $('<div>', { class : 'row' }
		  ).append
		  ( $('<div>', { class : 'col-sm-12' }
		    ).append
		    ( $( '<a>'
		      , { class : 'btn btn-info btn-sm'
			, style : 'width: 100%;'
			, href  : json_branch._links.html
			}
		      ).html
		      ( json_branch.commit.sha.substring( 0, 7 )
		      + ' ('
		      + json_branch.commit.commit.author.date.substring( 0, 10 )
		      + ')'
		      )
		    )
		  )
		);
		
		$('#gilapv-action-info'
		).attr
		( 'data-content',  $tool_info_data.html() 
		);
	    }
	  );
      }
    );
    
    var tmp = file_actions.find('.btn-group').clone();
    tmp.css('margin', '0 0 5px 5px');
    tmp.find('.btn').addClass('btn-sm');
    
    $.each
    ( tmp
    , function( index, value )
      {
	  $('#gilapv-file-actions-xs').prepend( value );
      }
    );
        
    $(document).keypress
    ( function( event )
      {
          switch( ( event.keyCode ? event.keyCode : event.which) )
          {
	      // shared controls
              case 105: // 'i'
              {
                  $('#gilapv-action-info').click();
                  break;
              }
              
	      // PDF specific controls
              case 37:  // <--
              case 98:  // 'b'
              {
                  $('#gilapv-action-pdf-prev').click();
                  break;
              }
              
              case 32:  // 'space'
              case 39:  // -->
              case 110: // 'n'
              {
                  $('#gilapv-action-pdf-next').click();
                  break;
              }
              case 118: // 'v' (toggle auto size width/height)
              {
                  $('#gilapv-action-pdf-fit').click();
                  break;
              }
              case 100: // 'd'
              {
                  $('#gilapv-action-pdf-download').click();
                  break;
              }
	      
	      // SVG specific controls
	      //           case 43:  // + (plus)
	      //           case 45:  // - (minus)
	      
	      // PDF and SVG controls
	      case 102: // 'f' (fullscreen)
              {
                  // $tool_fullscreen.click();
                  $('#gilapv-action-pdf-fullscreen').click();
                  $('#gilapv-action-svg-fullscreen').click();
                  break;
              }
	      
              default:
              {
                  //console.log( event );
                  break;
              }
          }
      }
    );
    
    
    $('[data-toggle="popover"]').popover( { html : true } );
    $('[data-toggle="tooltip"]').tooltip( { delay: {show: 500, hide: 100} } );
}

$(document).ready
( function()
  {
      main();
  }
);

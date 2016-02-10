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

    if( error > 0 )
    {
	return;
    }

    $.fn.redraw = function()
    {
        $(this).each
        ( function()
          {
              var redraw = this.offsetHeight;
          }
        );
    };
    
    var link = $('a[href$=".pdf"]:first').attr('href');
    if( link == null ) 
    {
	return;
    }
    
    $(document).ready
    ( function()
      {
          window.lock = false;
	  $('[data-toggle="popover"]').popover( { html : true } );
          $('[data-toggle="tooltip"]').tooltip( { delay: {show: 500, hide: 100} } ); 
      }
    );
    
    
    var url = window.location.origin + link.replace( '/blob/', '/raw/' );
    
    var fc = $('.file-content');
    var dl = $('div[class$="light"]:first');
    
    // var $progress = $('<div>', { class : 'progress', style : 'width: 37.5%; float: right;' });
    // dl.append( $progress );
    // var $progress_bar = $('<div>', 
    // { class : 'progress-bar', role : 'progressbar', style : 'width: 0%; color: black;' });    
    // $progress.append( $progress_bar );
    // $progress_bar.attr( 'aria-valuenow', '0' );
    // $progress_bar.attr( 'aria-valuemin', '0' ); 
    // $progress_bar.attr( 'aria-valuemax', '100' );
    // $progress_bar.html( ' 0% ' );
    
    var $gilapv  = $('<div>', { id : 'gilapv' });
    fc.append( $gilapv );
    
    var $gilapv_tools  = $('<span>', { id : 'gilapv-tools', style : 'float: right; margin-top: -5px;' });
    //$gilapv.append( $gilapv_tools );
    dl.append( $gilapv_tools );
    
    var $gilapv_pdf_file  = $('<div>', { id : 'gilapv-pdf-file', style : 'width: 100%; margin-top: 10px; text-align: center;' });
    $gilapv.append( $gilapv_pdf_file );
    
    var pages = new Array();
    var first = true;
    var scale_mode = 'width';
    
    function renderPage(page,num) 
    {
	var canvas_id = 'gilapv-page'; // + num + '-page';
	var tlayer_id = 'gilapv-text'; // + num + '-text';
        
	var scale = 0.1;
	var viewport = page.getViewport(scale);

        var bound  = (scale_mode == 'width') ? fc.width()     : ( $('.nicescroll').height() - fc.offset().top ) - 60;
        var actual = (scale_mode == 'width') ? viewport.width : viewport.height;
        
	while( actual <= bound )
	{
	    scale = scale + 0.001;
	    viewport = page.getViewport(scale);
            actual = (scale_mode == 'width') ? viewport.width : viewport.height;
	}
        
        
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
	    $gilapv_pdf_file.append( canvas );

            var $tlayer = $('<div>', { id : tlayer_id, class : 'textLayer' });
            $gilapv_pdf_file.append( $tlayer );
        }
	else
	{
	    $( '#' + canvas_id ).replaceWith( canvas );
            $( '#' + tlayer_id ).empty();
	}
        
        var offset = $( '#' + canvas_id ).offset();
        var $textLayerDiv = $( '#' + tlayer_id  ).css
        ( { height : viewport.height+'px'
          , width : viewport.width+'px'
          , top : offset.top
          ,  left : offset.left
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

    
    var selected_page = 1;
    function refresh()
    {
        $tool_page_current.val( selected_page );
        $tool_page_current.attr( 'data-original-title', 'Page ' + selected_page + ' of ' + pages.length );
        
        renderPage( pages[selected_page-1], selected_page-1 );        
        return;
        
        for(num = 0; num < pages.length; num++) 
	{
	    renderPage( pages[num], num );
	}
    }
    
    PDFJS.disableWorker = true;
    PDFJS.getDocument(url).then
    ( function getPdf(pdf) 
      {
          var percent = 0.0;
          
    	  for(num = 1; num <= pdf.numPages; num++) 
    	  {
    	      pdf.getPage(num).then
    	      ( function processPage(page)
		{
		    pages.push( page );
                    
                    // ncvar pb = $('.progress-bar');
                    // percent = percent + (100.0 / pdf.numPages);
                    // console.log( percent );
                    // //pb.progressbar( 'value', percent );
                    
                    // pb.css( 'width', Math.floor(percent) + '%' );
    		    // // if( percent >= 100 )
    		    // // {
		    // //     setTimeout
		    // //     ( function()
		    // //       {
    		    // //           pb.addClass( 'progress-bar-success' );
		    // //       }
		    // //     , 500
		    // //     );
    		    // // }
    		    // pb.html( ' ' + Math.floor(percent) + '% ' );
                    // pb.redraw();
                    
		    if( pages.length == pdf.numPages )
		    {
                        $tool_page_current.attr( 'max', pages.length );
                        refresh();
			first = false;
		    }
		}
    	      );
    	  }
      }
    );
    
    $(window).resize
    ( function()
      {
	  clearTimeout( window.resizedFinished );
	  window.resizedFinished = setTimeout
	  ( function()
	    {
		refresh();
	    }
	  , 125
	  );
      }
    );

    var $tool_page_previous = $('<label>', { class : 'btn btn-sm fa fa-arrow-circle-left', style : 'margin-right: 5px;' });
    $gilapv_tools.append( $tool_page_previous );
    $tool_page_previous.attr( 'data-toggle', 'tooltip' );
    $tool_page_previous.attr( 'title',       'Previous Page' );
    $tool_page_previous.click
    ( function()
      {
          if( selected_page > 1 )
          {
              selected_page = selected_page - 1;
          }
          refresh();
      }
    );
    
    var $tool_page_next = $('<label>', { class : 'btn btn-sm fa fa-arrow-circle-right', style : 'margin-right: 5px;' });
    $gilapv_tools.append( $tool_page_next );
    $tool_page_next.attr( 'data-toggle', 'tooltip' );
    $tool_page_next.attr( 'title',       'Next Page' );
    $tool_page_next.click
    ( function()
      {
          if( selected_page < pages.length )
          {
              selected_page = selected_page + 1;
          }
          refresh();
      }
    );
    
    var $tool_page_current = $('<input>', { id : 'gilapv-current-page'
                                            , class : 'input-sm small'
                                            , style : 'margin-right: 5px;'
                                            , type : 'number'
                                            , value : '1' });
    $gilapv_tools.append( $tool_page_current );
    $tool_page_current.attr( 'data-toggle', 'tooltip' );
    $tool_page_current.attr( 'title',       '...' );
    $tool_page_current.attr( 'min',         '1' );
    $tool_page_current.attr( 'max',         '1' );
    $tool_page_current.on
    ( 'input', function(e)
      {
          selected_page = parseInt( $('#gilapv-current-page').val() ) || -1;
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
          refresh();
      }
    );

    var $tool_fit_width = $('<label>', { class : 'btn btn-sm fa fa-arrows-h', style : 'margin-right: 5px;' });
    $gilapv_tools.append( $tool_fit_width );
    $tool_fit_width.attr( 'data-toggle', 'tooltip' );
    $tool_fit_width.attr( 'title',       'Fit width' );
    $tool_fit_width.click
    ( function()
      {
          scale_mode = 'width';
          refresh();
      }
    );

    var $tool_fit_height = $('<label>', { class : 'btn btn-sm fa fa-arrows-v', style : 'margin-right: 5px;' });
    $gilapv_tools.append( $tool_fit_height );
    $tool_fit_height.attr( 'data-toggle', 'tooltip' );
    $tool_fit_height.attr( 'title',       'Fit height' );
    $tool_fit_height.click
    ( function()
      {
          scale_mode = 'height';
          refresh();          
      }
    );
    
    var $tool_refresh = $('<label>', { class : 'btn btn-sm fa fa-refresh', style : 'margin-right: 5px;' });
    //$gilapv_tools.append( $tool_refresh );
    $tool_refresh.attr( 'data-toggle', 'tooltip' );
    $tool_refresh.attr( 'title',       'Refresh PDF' );
    $tool_refresh.click
    ( function()
      {
      }
    );
        
    var $tool_fullscreen = $('<label>', { class : 'btn btn-sm fa fa-arrows-alt', style : '' });
    //$gilapv_tools.append( $tool_fullscreen );
    $tool_fullscreen.attr( 'data-toggle', 'tooltip' );
    $tool_fullscreen.attr( 'title',       'Presentation Mode' );
    var $fullscreen = $('<div>', { id : 'gilapv-fullscreen', class : 'modal modal-fullscreen fade', style : 'text-align: center;' });
    $gilapv.append( $fullscreen );
    $tool_fullscreen.click
    ( function()
      {
          fullscreen_handler('show');
          $fullscreen.empty();
      }
    );
    $fullscreen.on
    ( 'show.bs.modal'
    , function()
      {
          fullscreen_handler( true );
      }
    );
    $fullscreen.on
    ( 'hide.bs.modal'
    , function()
      {
          fullscreen_handler( 'hide' );
      }
    );
    
    $(document).on( 'webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange', fullscreen_handler );
    
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
        }

        if( typeof( action ) == "object" )
        {
            if( status == false && fullscreen_last_status == false )
            {
                $fullscreen.modal( 'hide' );
            }
        }
        else if( action == 'show' )
        {
            $fullscreen.modal( 'show' );            
            fullscreen_mode( true );            
        }
        else if( action == 'hide' )
        {

            fullscreen_mode( false );
        }

        fullscreen_handler_last_status = status;

        //console.log( $('body').css( 'width' ) + ', ' + $('#body').css( 'height' ) );
    }
    
    
    
    var $tool_info = $('<a>', { class : 'btn btn-info btn-sm fa fa-info-circle', style : 'margin-left: 50px;' });
    $gilapv_tools.append( $tool_info );
    $tool_info.attr( 'data-toggle',    'popover' );
    $tool_info.attr( 'data-placement', 'left' );
    $tool_info.attr( 'title',          'Plugin Information' );
    $tool_info.attr( 'data-content',   'unable to load' );
    var $tool_info_data = $('<div>');
    $.getJSON
    ( "https://api.github.com/repos/ppaulweber/gilapv"
    , function( json_repo ) 
      {
	  $.getJSON
	  ( "https://api.github.com/repos/ppaulweber/gilapv/branches/stable"
	  , function( json_branch ) 
	    {
		$tool_info_data.append
		( $('<div>').html( $('<b>').html( json_repo.description )) 
		).append
		( $('<br>')
		).append
		( $('<div>', {class : 'row'}).append
		  ( $('<div>', {class : 'col-sm-4'}).html( 'Revision:' )
		  ).append
		  ( $('<div>', {class : 'col-sm-8'}).append
		    ( $('<a>', {class : 'btn btn-info btn-sm', style : 'width: 100%;', href : json_branch._links.html}).html
		      ( json_branch.commit.sha.substring( 0, 7 )
                        + ' ('
                        + json_branch.commit.commit.author.date.substring( 0, 10 )
                        + ')'
		      )
		    )
		  )
		);
		
		$tool_info.attr( 'data-content',  $tool_info_data.html() );
	    }
	  );
      }
    );
    
    
    $(document).keypress
    ( function( event )
      {
          switch( ( event.keyCode ? event.keyCode : event.which) )
          {
              case 37:  // <--
              case 112: // 'p'
              {
                  $tool_page_previous.click();
                  break;
              }
              
              case 39:  // -->
              case 110: // 'n'
              {
                  $tool_page_next.click();
                  break;
              }
              case 105: // 'i'
              {
                  $tool_info.click();
                  break;
              }
              case 119: // 'w' (default) (auto size width)
              {
                  $tool_fit_width.click();
                  break;
              }
              case 104: // 'h' (auto size height)
              {
                  $tool_fit_height.click();
                  break;
              }
              case 100: // 'd'
              {
                  // use to directly download the PDF file
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
}

main();


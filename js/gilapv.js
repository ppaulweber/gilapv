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
    
    
    
    var link = $('a[href$=".pdf"]:first').attr('href');
    if( link == null ) 
    {
	return;
    }
    
    $(document).ready
    ( function()
      {
	  $('[data-toggle="popover"]').popover( { html : true } );
      }
    );
    
    
    var url = window.location.origin + link.replace( '/blob/', '/raw/' );
    
    var fc = $('.file-content');
    var dl = $('div[class$="light"]:first');
    var $progress = $('<div>', { class : 'progress', style : 'width: 60%; float: right;' });
    dl.append( $progress );
    var $progress_bar = $('<div>', 
    { class : 'progress-bar', role : 'progressbar', style : 'width: 0%; color: black;' });    
    $progress.append( $progress_bar );
    $progress_bar.attr( 'aria-valuenow', '0' );
    $progress_bar.attr( 'aria-valuemin', '0' ); 
    $progress_bar.attr( 'aria-valuemax', '100' );
    $progress_bar.html( '0% rendered' );

    var $gilapv  = $('<div>', { id : 'gilapv' });
    fc.append( $gilapv );

    var $gilapv_tools  = $('<div>', { id : 'gilapv-tools', style : 'margin-top: 20px; margin-bottom: 10px;' });
    $gilapv.append( $gilapv_tools );

    var $tool_refresh = $('<button>', { type : 'button', class : 'btn btn-dark btn-sm', style : '' });
    $gilapv_tools.append( $tool_refresh );
    var $tool_refresh_view = $('<span>', { class : 'fa fa-refresh' });
    $tool_refresh.append( $tool_refresh_view );
    
    
    var $tool_info = $('<a>', { class : 'btn btn-info btn-sm', style : 'float: right;' });
    $gilapv_tools.append( $tool_info );
    var $tool_info_view = $('<span>', { class : 'fa fa-info-circle' });
    $tool_info.append( $tool_info_view );
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
		  ( $('<div>', {class : 'col-sm-6'}).html( 'Revision' )
		  ).append
		  ( $('<div>', {class : 'col-sm-6'}).append
		    ( $('<a>', {class : 'btn btn-info btn-sm', style : 'width: 100%;', href : json_branch._links.html}).html
		      ( json_branch.commit.sha.substring(0, 7)
		      )
		    )
		  )
		);
		
		$tool_info.attr( 'data-content',  $tool_info_data.html() );
	    }
	  );
      }
    );    
    
    
    
    var $gilapv_pdf_file  = $('<div>', { id : 'gilapv-pdf-file' });
    $gilapv.append( $gilapv_pdf_file );
    
    function calcView(page)
    {
	var scale = 0.1;
	var viewport = page.getViewport(scale);	    
	var width = fc.width();
	while( viewport.width <= width )
	{
	    scale = scale + 0.001;
	    viewport = page.getViewport(scale);
	}
	return viewport;
    }
    
    var pages = new Array();
    var first = true;
    
    function renderPage(page,num) 
    {
	var canvas_id = 'gilapv-' + num + '-page';
	var tlayer_id = 'gilapv-' + num + '-text';
        
	var viewport = calcView(page);
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
                , pageIndex : num - 1
                , viewport : viewport
                }
              );

              textLayer.setTextContent( text );
              textLayer.render();
          }
        );
    }
    
    function refresh()
    {
	for(num = 0; num < pages.length; num++) 
	{
	    renderPage( pages[num], num );
	}
    }
    
    PDFJS.disableWorker = true;
    PDFJS.getDocument(url).then
    ( function getPdf(pdf) 
      {
    	  for(num = 1; num <= pdf.numPages; num++) 
    	  {
    	      pdf.getPage(num).then
    	      ( function processPage(page)
		{
		    pages.push( page );
		    
		    var pb = $('.progress-bar');
    		    percent = ((num-1) * 100) / (pdf.numPages);
    		    pb.css( 'width', percent + '%' );
    		    if( percent >= 100 )
    		    {
			setTimeout
			( function()
			  {
    			      pb.addClass( 'progress-bar-success' );
			  }
			, 500
			);
    		    }
    		    pb.html( percent + '% rendered' );
		    
		    if( pages.length == pdf.numPages )
		    {
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

    $tool_refresh.click
    ( function()
      {
      }
    );
}

main();

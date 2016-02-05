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

var link = $('a[href$=".pdf"]:first').attr('href');

if( link != null ) 
{
    var url = window.location.origin + link.replace( "/blob/", "/raw/" );
    
    var $gitlab_pdf = $("<div>", { id : "gitlab-pdf" });
    var $progress = $("<div>", { class : "progress" });
    var $progress_bar = $("<div>", { class : "progress-bar", role : "progressbar", style : "width: 1%;" });
    $progress_bar.attr( "aria-valuenow", "1" );
    $progress_bar.attr( "aria-valuemin", "0" ); 
    $progress_bar.attr( "aria-valuemax", "100" );
    
    $('.file-content').append( $gitlab_pdf );
    $gitlab_pdf.append( $progress )
    $progress.append( $progress_bar );
    
    PDFJS.getDocument(url).then
    ( function getPdf(pdf) 
      {
    	  for(var num = 1; num <= pdf.numPages; num++) 
    	  {
    	      pdf.getPage(num).then
    	      ( function renderPage(page) 
    		{
    		    var scale = 1.5;
    		    var viewport = page.getViewport(scale);
    		    var canvas = document.createElement('canvas');
    		    var ctx = canvas.getContext('2d');
    		    var renderContext = {
    			canvasContext: ctx,
    			viewport: viewport
    		    };
    		    canvas.height = viewport.height;
    		    canvas.width = viewport.width;
    		    $('#gitlab-pdf').append(canvas);
    		    page.render(renderContext);
    		    var pb = $('.progress-bar');
    		    percent = ((num-1) * 100) / (pdf.numPages);
    		    pb.css( 'width', percent + "%" );
    		    if( percent >= 100 )
    		    {
    			pb.addClass('progress-bar-success');
    		    }
    		    pb.html( percent );
    		}
    	      );
    	  }
      }
    );
}

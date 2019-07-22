function isContentEdit(){
  let url = window.location.href;

  if(url.indexOf('.html') < 0 ){
    $('body').on('click', function(e){
      e.preventDefault()
    });
  }
}

Builder = function (){
  this.el = null;
  this.prevEl = null;
  this.parent = null;
  this.prevParent = null;
  this.container = null;
  this.isDragging = false;
  this.components = components;  // this from components file
  this.blocks = blocks;
  this.textColorPicker = textColPicker;
  this.bgColorPicker = bgColPicker;
}

Builder.prototype = {
    init: function(container){
      this.container = $(container);
      this._loadBlockList();
    },

    loadUrl: function(url){
      this.container.load(url)
      this._builderHandle()
    },

    _builderHandle: function(){
      var self = this
      this._initHighlight()
      this._onDragComponent();
      this._toolsButtonClick();
      this._toolButtonPanelClick();
      this._setCssAttr();
      this._onColorPickerSave();
      this._onBgColorPickerSave();
      this._onParentToolBtnClick();
      this.onPropPanelInputChange();
    }, 

    _initHighlight: function(){
      var self = this
      this.container.on('click', function(e){
        if(self.prevEl != null) { 
          //self.prevEl.removeClass('highlight-active');
          //self.prevEl.attr('contenteditable','false');
          self._removePrevElHighlight();
        }
        
        self.el = $(e.target)
        self.parent = $($(e.target).parents().closest('section')[0])
        //self.el.addClass('highlight-active'); 
       
        self._highlightToParagraphOrDiv(e.target);
        
        //self.prevEl = self.el;
        self._showElTool();
        self._findCssAttr();
        
        var textColor = self.el.css('color');
        if(textColor!=undefined)
          self.textColorPicker.setColor(textColor.toString())

        var bgColor = self.parent.css('background-color') == 'rgba(0, 0, 0, 0)' ? "rgb(255, 255, 255)" : self.parent.css('background-color');
        self.bgColorPicker.setColor(bgColor)


        var mainParent = $(e.target).parents().closest('section')[0];
        if(mainParent!=null){
           self._showParentTool(mainParent)
        }
      });
    },

    _removePrevElHighlight: function(){
      this.prevEl.removeClass('highlight-active');
      this.prevEl.attr('contenteditable','false');

      this._removeImgResizer();
      
    },

    _showElTool: function(){
      var self = this;
      var tool = $('.selected-el-tool');
      
      tool.show();
      this._moveElTool(this.el)
    },

    _moveElTool: function(el){
      var tool = $('.selected-el-tool');
      var maxRight = $('.builder-container').offset().left + $('.builder-container').width();
      var tool_width = tool.width();
      var tool_left =  el.offset().left;

      tool.animate({
        top: el.offset().top - 45,
        left: tool_left - (maxRight - tool_left > tool_width ? 0 : (tool_width / 3) + 10)
      });
    },

    _showParentTool: function(parent){
      var self = this;
      var tool = $('.selected-parent-tool');

      tool.show();
      this._moveParentTool(parent);
    },

    _moveParentTool: function(parent){
      var tool = $('.selected-parent-tool');
      tool.animate({
        top: $(parent).offset().top,
        left: $('.builder-container').offset().left + $('.builder-container').width()+ 10
      });
    },

    _moveParentToolToPoint: function(point){
      var tool = $('.selected-parent-tool');
      tool.animate({
        top: point,
        left: $('.builder-container').offset().left + $('.builder-container').width()+ 10
      });
    },
    
    _onDragComponent: function(){
      var mainParent = null
      var self = this
      var dragEltext = null
      var dragElDataBlock = null

      $( ".draggable" ).draggable({
        helper: "clone",
        start: function(){
          dragEltext = $(this).text();
          dragElDataBlock = $(this).attr('data-block');
        },
        drag: function(e){
            $('.builder-container *').on('mouseenter', function(e){
              mainParent = $(e.target).parents().closest('section')[0];
              if(mainParent!=null){
                $('.append-box').remove();
                $(mainParent).after("<div class='append-box'></div>");
              }
           });

           $('.builder-container *').on('mouseleave', function(e){
              $('.append-box').remove()  
           });
           
           self.container.droppable({
            drop: function(){
              var tag = self.blocks.find(comp => comp.name == dragElDataBlock );
              $(mainParent).after(tag.html)
            }
           })
        },
        stop: function(){
          $('.append-box').remove();
          $('.builder-container *').unbind('mouseenter')
          $('.builder-container *').unbind('mouseleave')
        }
      });
    },

    _toolsButtonClick(){
      var self = this
      $('.selected-el-tool-btn').click(function(e){
        e.preventDefault()
        var cmd = $(this).attr('cmd');
        console.log('hallo')
        if(cmd == 'trash'){
          self._removeElement(self.el);
        }
      });
    },

    _toolButtonPanelClick(){
      var self = this
      $(".sq-link").click(function(e){
        var attrtag = $(this).attr('data-html');
        var tag = components.find(comp => comp.id == attrtag );
        $(self.el).after(tag.html);
        $(".sq-dropdown").hide();   
        $(".selected-el-tool").hide();
        $(self.el).removeClass('highlight-active')        
      })
    },

    _loadBlockList: function(){
      blocks.map(function(block, index){
        $('#block-list').append("<li class='draggable' data-block="+block.name+"><img class='block-img' width='220' height='auto' src='assets/blocks/"+block.img+"'/></li>")
      })
    },

    _highlightToParagraphOrDiv: function(el){
      var pdiv = $(el).parents().closest('p')[0] || $(el).parent('div')[0]
      if(pdiv!= undefined){
        //this._highlightActive(pdiv);
        this._highlightActive(el);
      } else {
        if(!$(el).hasClass('row-section') && !$(el).hasClass('builder-container')){
          this._highlightActive(el);
          this._isImageElement();
        } else {
          this._highlightNonActive(el)
        }
      }
    },

    _setCssAttr: function(){
      var self = this
      $(".css-attr-btn").click(function(){
        var cssAttr = $(this).attr('css-attr').split(":")
        var cmd = $(this).attr('cmd');
        if(cmd != undefined && window.getSelection().toString()!= ""){
          document.execCommand(cmd)
        } else {
          if($(this).attr('css-attr-active') == 'true'){
            $(self.el).css(cssAttr[0], '');
            $(this).removeAttr('css-attr-active')
          } else {
            if ($(this).attr('css-attr-group') != undefined){
              $("[css-attr-group='"+ $(this).attr('css-attr-group') +"']").removeAttr('css-attr-active');
            }
            $(this).attr('css-attr-active','true');
            $(self.el).css(cssAttr[0], cssAttr[1]);
          }
          
        }
      }) 
    },

    _removeElement: function(el){
      $(el).fadeOut(100,function(){
        $(el).remove();
      });
      
      $(".sq-dropdown").hide();   
      $(".selected-el-tool").fadeOut();
      $(el).removeClass('highlight-active'); 
      this._removeImgResizer();
    },

    _highlightActive :function(el){
      $(el).addClass('highlight-active');
      this.prevEl = $(el)
      $(el).attr('contenteditable','true');
      $(el).focus();
    },

    _highlightNonActive: function(el){
      this.prevEl = null
      //$(el).attr('contenteditable','false');
      $(el).removeClass('highlight-active');
      $('.selected-parent-tool').hide();
      $('.selected-el-tool').hide();
    },

    _findCssAttr: function(){
      $('.css-attr-btn').removeAttr('css-attr-active');
      var csslist = $(this.el).attr('style')
      if(csslist != undefined){
        var list = csslist.split(";")
        list.map(function(val, index){
          $("[css-attr='"+val.trim()+"']").attr('css-attr-active', 'true');
        });
      }
    },

    _isImageElement: function(){
      var self = this;
      if(self.el.prop('tagName')=='IMG'){
        var toolTop="<span class='image-tool-resizer-top' />";
        var toolBottm="<div class='image-tool-resizer-bottom' draggable='true'/>";

        var topTop = $(self.el).offset().top - 5;
        var topLeft = $(self.el).offset().left - 5;

        var bottmTop = ($(self.el).offset().top - 5) + (self.el.height());
        var bottmLeft = ($(self.el).offset().left - 5) + (self.el.width());
        $('body').append(toolTop); 
        $('body').append(toolBottm);
        $('.image-tool-resizer-top').css('top', topTop);
        $('.image-tool-resizer-top').css('left', topLeft);  

        $('.image-tool-resizer-bottom').css('top', bottmTop);
        $('.image-tool-resizer-bottom').css('left', bottmLeft); 

        $('.image-tool-resizer-bottom').draggable({
          helper:'clone',
          drag: function(ev){
            var nbottmTop = ($(self.el).offset().top - 5) + (self.el.height());
            var nbottmLeft = ($(self.el).offset().left - 5) + (self.el.width());
            $('.image-tool-resizer-bottom').css('top', nbottmTop);
            $('.image-tool-resizer-bottom').css('left', nbottmLeft);
            var x = ev.pageX - self.el.offset().left;
            self.el.css("width", x);         
          },
          stop: function(){
            var nbottmTop = ($(self.el).offset().top - 5) + (self.el.height());
            var nbottmLeft = ($(self.el).offset().left - 5) + (self.el.width());
            $('.image-tool-resizer-bottom').css('top', nbottmTop);
            $('.image-tool-resizer-bottom').css('left', nbottmLeft); 
          }
        });
      }
    },

    _findCssForPropertiesPane: function(){
      var csslist = $(this.el).attr('style')
    },

    _removeImgResizer: function(){
      if(this.el.prop('tagName')=='IMG'){
        $('.image-tool-resizer-top').remove();
        $('.image-tool-resizer-bottom').remove();
      }
    },

    _onColorPickerSave: function(){
      this.textColorPicker.on('save', (color) => {
        const col =  color.toHEXA().toString();
        this.el.css('color', col)
      });
    },
    
    _onBgColorPickerSave: function(){
      var self = this;
      this.bgColorPicker.on('save', (color) => {
        const col =  color.toHEXA().toString();
        $(self.parent).css('background-color', col);
      });
    },
    
    _onParentToolBtnClick: function(){
      var self = this;
      $(".selected-parent-tool a").click(function(e){
        e.preventDefault();
        var cmd = $(this).attr("cmd");
        switch(cmd){
          case 'move-to-prev' :
            self._moveToPrev(self.parent)
            break;
          case 'move-to-next' :
            self._moveToNext(self.parent)
          case 'trash' :
            self._removeElement(self.parent)
            break;
        }
      })
    },

    _moveToPrev(el){
      var html = $(el).get(0).outerHTML;
      var prevEl = $(el).prev();
      $(prevEl).before(html.replace("highlight-active","").replace('contenteditable="true"',""));
    
      $(".selected-el-tool").fadeOut();
      $(".selected-parent-tool").fadeOut();
      $(el).removeClass('highlight-active');   
      $(el).remove();
      this.parent = null;
    },

    _moveToNext(el){
      var html = $(el).get(0).outerHTML;
      var nextEl = $(el).next();
      nextEl.after(html.replace("highlight-active","").replace('contenteditable="true"',""));

      $(el).remove();
      $(".selected-el-tool").fadeOut();
      $(".selected-parent-tool").fadeOut();
      this.parent = null;
    },
    
    onPropPanelInputChange: function(){
      $('.css-attr-input').change(function(e){
        console.log(e);
      })
    }
}

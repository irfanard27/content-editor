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
    }, 

    _initHighlight: function(){
      var self = this
      this.container.on('click', function(e){
        if(self.prevEl != null) { 
          self.prevEl.removeClass('highlight-active');
          self.prevEl.attr('contenteditable','false');
        }
        
        self.el = $(e.target)
        //self.el.addClass('highlight-active'); 
        self._highlightToParagraphOrDiv(e.target);
        
        //self.prevEl = self.el;
        self._showElTool();     

        var mainParent = $(e.target).parents().closest('.row-section')[0];
        if(mainParent!=null){
           self._showParentTool(mainParent)
        }
      });
    },

    _showElTool: function(){
      var self = this;
      var tool = $('.selected-el-tool');

      tool.show();
      tool.animate({
        top: self.el.offset().top - 45,
        left: self.el.offset().left 
      });
    },

    _showParentTool: function(parent){
      var self = this;
      var tool = $('.selected-parent-tool');

      tool.show();
      tool.animate({
        top: $(parent).offset().top,
        left: $(parent).offset().left + $(parent).width() + 20
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
              mainParent = $(e.target).parents().closest('.row-section')[0];
              if(mainParent!=null){
                $('.append-box').remove();
                $("<div class='append-box'></div>").appendTo(mainParent)
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
        var cmd = $(this).attr('css-attr-value');
        var cssattr = $(this).attr('css-attr');
        if(cmd == 'trash'){
          $(self.el).remove();
          $(".sq-dropdown").hide();   
          $(".selected-el-tool").hide();
          $(self.el).removeClass('highlight-active') 
        } else {

          if(window.getSelection().toString()!= ""){
            document.execCommand(cmd)
          } else {
            $(self.el).css(cssattr, cmd)
            console.log(cssattr)
          }
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
        $(pdiv).addClass('highlight-active');
        this.prevEl = $(pdiv)
        $(pdiv).attr('contenteditable','true');
      } else {
        if(!$(el).hasClass('row-section') && !$(el).hasClass('builder-container')){
          $(el).addClass('highlight-active'); 
          this.prevEl = $(el)
          this.el.attr('contenteditable','true');
        } else {
          this.prevEl = null
          $(el).attr('contenteditable','false');
          $(el).removeClass('highlight-active');
          $('.selected-parent-tool').hide();
          $('.selected-el-tool').hide();
          
        }

      }
    },

    _setCssAttr(){
      var self = this
      $(".css-attr-btn").click(function(){
        var cssAttr = $(this).attr('css-attr');
        var cssAttrVal = $(this).attr('css-attr-value');
        $(self.el).css(cssAttr, cssAttrVal);
      })
      
    }
    
}
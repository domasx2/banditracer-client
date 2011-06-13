
exports.ui_background='#FFE566';

exports.alert_box_border='black';
exports.alert_box_background='#FFE566';

//fonts name:[css description, color]
exports.fonts={'hud':['30px "Showcard Gothic"', 'red'],         //in game hud
               'header':['40px Aharoni', '#282828'],            //ui scene headers
               'default':['20px Aharoni', '#282828'],           //labels, default if not specified
               'small_header':['bold 16px Arial', 'black'],     //table headers
               'small':['bold 14px Arial', 'black'],             //table cells
               'alias':['bold 14px Arial', '#4CFF00']  //ingame multiplayer player alias
               }; 
               

//ui button
exports.button={'border':'#282828',              //button border
                'font':'default',                 //default font
                'fill':'#FFE566',                 //default fill
                'hover_fill':'#FFBE00',          //fill on hover
                'selected_fill':'#FF6A00'};       //fill when selected

//label
exports.label={'font':'default'}; 

//textbox
exports.textbox={'font':'default',
                 'border':'#282828',
                 'background':'#FFEFAA'};
                

//table
exports.table={'header_font':'small_header',
                'data_font':'small',
                'border':'#C6A500',
                'header_fill':'#FFD000',         //header row background
                'hover_fill':'#FFBE00',          //fill on row hover
                'selected_fill':'#FF6A00',       //fill on row selected
                'row_line':'#FFD000'};           //my english fails me. its the line between rows
                
//track info display
exports.trackinfodisplay={'header_font':'default',
                          'outline_color':'#808080'};
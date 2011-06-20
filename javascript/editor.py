"""
Level editor for combatracer,
Domas Lapinskas 2011

requires:
python 2.5+
wxPython
PIL
simple json

"""
import wx, os, sys
import math
import simplejson
from PIL import Image
TILE_WIDTH_PX=50 #tile width (or height) in pixels
PHYS_SCALE=10.0
MINI_MAP_TILE_WIDTH_PX=5
app=None
levelframe=None
cur_level=None
base_tilepath='images/tiles/'
base_proppath='images/props/'





def PilImageToWxImage( myPilImage, copyAlpha=True ) :

    hasAlpha = myPilImage.mode[ -1 ] == 'A'
    if copyAlpha and hasAlpha :  # Make sure there is an alpha layer copy.

        myWxImage = wx.EmptyImage( *myPilImage.size )
        myPilImageCopyRGBA = myPilImage.copy()
        myPilImageCopyRGB = myPilImageCopyRGBA.convert( 'RGB' )    # RGBA --> RGB
        myPilImageRgbData =myPilImageCopyRGB.tostring()
        myWxImage.SetData( myPilImageRgbData )
        myWxImage.SetAlphaData( myPilImageCopyRGBA.tostring()[3::4] )  # Create layer and insert alpha values.

    else :    # The resulting image will not have alpha.

        myWxImage = wx.EmptyImage( *myPilImage.size )
        myPilImageCopy = myPilImage.copy()
        myPilImageCopyRGB = myPilImageCopy.convert( 'RGB' )    # Discard any alpha from the PIL image.
        myPilImageRgbData =myPilImageCopyRGB.tostring()
        myWxImage.SetData( myPilImageRgbData )

    return myWxImage

def WxImageToWxBitmap( myWxImage ) :
    return myWxImage.ConvertToBitmap()

def PilImageToWxBitmap( myPilImage ) :
    return WxImageToWxBitmap( PilImageToWxImage( myPilImage ) )
    
class Selectable:
    
    def unselect(self):
        pass

class FollowMouse:
    pass
    
class Rotatable:
    
    def __init__(self, step, angle):
        self.step=step
        self.angle=angle
    
    def rotateRight(self):
        self.angle+=self.step
        if self.angle==360:
            self.angle=0
    
    def rotateLeft(self):
        self.angle-=self.step
        if self.angle==-self.step:
            self.angle=360-self.step

        

class Checkpoint(Selectable, FollowMouse):
    
    def __init__(self, no, pt1=None, pt2=None):
        self.no=no
        self.pt1=pt1
        self.pt2=pt2
        self.size=(30, 30)
        
    def paint(self, dc, x=None, y=None):
        
        if self.pt1 and self.pt2:
            dc.SetPen(wx.Pen('#FF0000'))
            dc.SetBrush(wx.Brush('#FF0000', style=wx.TRANSPARENT))
            dc.SetTextForeground('#FF0000')
            dc.SetFont(wx.Font(20, wx.FONTFAMILY_ROMAN, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
            dc.DrawText(str(self.no), (self.pt1[0]+self.pt2[0])/2, (self.pt1[1]+self.pt2[1])/2)
            #DrawRectangle(self, x, y, width, height)
            dc.DrawRectangle(self.pt1[0], self.pt1[1], self.pt2[0]-self.pt1[0], self.pt2[1]-self.pt1[1])
            
        elif not self.pt1 and not self.pt2 and x and y:
            dc.SetTextForeground('#FF0000')
            dc.SetFont(wx.Font(20, wx.FONTFAMILY_ROMAN, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
            dc.DrawText(str(self.no), x+5, y)
    
    def unselect(self):
        if not self.pt2:
            self.pt1=None
            self.x=None
            self.y=None
        
    def set(self, x, y):
        if not self.pt1:
            self.pt1=(x, y)
            self.x=x
            self.y=y
        elif self.pt1 and not self.pt2 and x>self.pt1[0] and y > self.pt1[1]:
            self.pt2=(x, y)
            self.size=(x-self.pt1[0], y-self.pt1[1])
            app=wx.GetApp()
            for pos in app.level.checkpoints:
                if pos==self:
                   break
            else:
                app.level.checkpoints.append(self)
            nextpos=int(app.levelframe.panel_left.checkpoint_no.GetValue())+1
            app.levelframe.panel_left.checkpoint_no.SetValue(str(nextpos))
            app.select(Checkpoint(nextpos))
        
            
    def delete(self):
        app=wx.GetApp()
        app.level.checkpoints=[pos for pos in app.level.checkpoints if pos!=self]
        app.select(None)
        app.refresh()
        
    def paintBox(self, dc):
        if self.pt1 and self.pt2:
            dc.SetPen(wx.Pen("blue", style=wx.SOLID))
            dc.SetBrush(wx.Brush("blue", style=wx.TRANSPARENT))
            dc.DrawRectangle(self.pt1[0],
                            self.pt1[1],
                            self.size[0],
                            self.size[1])
            
    def __str__(self):
        return 'Checkpoint %s' % self.pos
    

class AIWaypoint(Selectable, FollowMouse):
    
    def __init__(self, no, x=None, y=None):
        self.no=no
        self.x=x
        self.y=y
        self.size=(30, 30)
        
    def paint(self, dc, x=None, y=None):
        dc.SetTextForeground('#0026FF')
        dc.SetFont(wx.Font(20, wx.FONTFAMILY_ROMAN, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        dc.DrawText(str(self.no), x or self.x+5, y or self.y)
        
    def set(self, x, y):
        self.x=x-self.size[0]/2
        self.y=y-self.size[1]/2

        app=wx.GetApp()
        for pos in app.level.ai_waypoints:
            if pos==self:
               break
            elif pos.no==self.no:
                for pos in app.level.ai_waypoints:
                    if pos.no>=self.no:
                        pos.no+=1
                app.level.ai_waypoints.append(self)
                break
        else:
            app.level.ai_waypoints.append(self)
            
        nextpos=int(app.levelframe.panel_left.ai_waypoint_no.GetValue())+1
        app.levelframe.panel_left.ai_waypoint_no.SetValue(str(nextpos))
        app.select(AIWaypoint(nextpos))
        
            
    def delete(self):
        app=wx.GetApp()
        for pos in app.level.ai_waypoints:
            if pos.no>self.no:
                pos.no-=1
                
        app.level.ai_waypoints=[pos for pos in app.level.ai_waypoints if pos!=self]
        app.select(None)
        app.refresh()
        
    def paintBox(self, dc):
        if self.x!=None:
            dc.SetPen(wx.Pen("blue", style=wx.SOLID))
            dc.SetBrush(wx.Brush("blue", style=wx.TRANSPARENT))
            dc.DrawRectangle(self.x,
                            self.y,
                            self.size[0],
                            self.size[1])
            
    def __str__(self):
        return 'AI waypoint %s' % self.pos
        
class CarPosition(Rotatable, Selectable, FollowMouse):
    
    def __init__(self, pos, x=None, y=None, angle=0):
        Rotatable.__init__(self, 90, angle)
        self.pos=pos
        self.x=x
        self.y=y
        self.size=(30, 30)
        
        
    def paint(self, dc, x=None, y=None):
        dc.SetTextForeground('#FF6A00')
        dc.SetFont(wx.Font(20, wx.FONTFAMILY_ROMAN, wx.FONTSTYLE_NORMAL, wx.FONTWEIGHT_BOLD))
        if x!=None:
            if self.angle==90:
                y+=self.size[1]
                x+=self.size[0]
            if self.angle==180:
                y+=self.size[1]
                x+=self.size[0]
            if self.angle==270:
                y+=self.size[1]
      #  print(self.angle)
        dc.DrawRotatedText(str(self.pos), x or self.x+5, y or self.y, -self.angle)
        
    
    def set(self, x, y):
       # self.x=x-self.size[0]/2
        #self.y=y-self.size[1]/2
        self.x=x
        self.y=y

        app=wx.GetApp()
        for pos in app.level.car_positions:
            if pos==self:
               break
        else:
            app.level.car_positions.append(self)
        nextpos=int(app.levelframe.panel_left.car_pos_no.GetValue())+1
        app.levelframe.panel_left.car_pos_no.SetValue(str(nextpos))
        app.select(CarPosition(nextpos))
        
            
    def delete(self):
        app=wx.GetApp()
        app.level.car_positions=[pos for pos in app.level.car_positions if pos!=self]
        app.select(None)
        app.refresh()
        
    def paintBox(self, dc):
        if self.x!=None:
            dc.SetPen(wx.Pen("blue", style=wx.SOLID))
            dc.SetBrush(wx.Brush("blue", style=wx.TRANSPARENT))
            dc.DrawRectangle(self.x,
                            self.y,
                            self.size[0],
                            self.size[1])
            
    def __str__(self):
        return 'Car position %s' % self.pos
                
class PropInstance(Selectable):
    
    def __init__(self, prop, x, y, angle):
        self.x=x
        self.y=y
        self.prop=prop
        self.size=prop.size
        self.angle=angle
        
    def __str__(self):
        'Prop instance %s (%s, %s) %s' % (self.prop.filename, self.x, self.y, self.angle)
        
    def paint(self, dc, x=None, y=None):
        self.prop.paint(dc, x or self.x, y or self.y, self.angle)
    
    def paintBox(self, dc):
        dc.SetPen(wx.Pen("blue", style=wx.SOLID))
        dc.SetBrush(wx.Brush("blue", style=wx.TRANSPARENT))
        dc.DrawRectangle(self.x,
                        self.y,
                        self.prop.size[0],
                        self.prop.size[1])
    
    def set(self, x, y):
        pass
        
    def delete(self):
        app=wx.GetApp()
        app.level.props=[prop for prop in app.level.props if prop!=self]
        app.select(None)
        app.refresh()

def getWorldSize(size):
    return [float(size[0])/PHYS_SCALE, float(size[1])/PHYS_SCALE]

def getWorldPosition(position, size=None):
    #position - in px
    #size -in px
    if size:
        return [(float(position[0])+float(size[0])/2)/PHYS_SCALE,
                (float(position[1])+float(size[1])/2)/PHYS_SCALE]
    else:
        return [float(position[0])/PHYS_SCALE, float(position[1])/PHYS_SCALE]

class Prop(Rotatable, FollowMouse):
    
    def __init__(self, filename):
        Rotatable.__init__(self, 5, 0)
        self.filename=filename
        
        path=os.path.join(base_proppath, filename)
        if not os.access(path, os.R_OK):
            raise Exception, 'No prop image: %s' % path
        
        image=Image.open(path)
        size=orig_size=image.size
        
        if size[0]!=size[1]:
            if size[0]<size[1]:
                ofst_x=(size[1]-size[0])/2
                ofst_y=0
                s=size[1]
            else:
                ofst_x=0
                ofst_y=(size[0]-size[1])/2
                s=size[0]
            
            nimg=Image.new('RGBA',(s, s))
            nimg.paste(image, (ofst_x, ofst_y))
            image=nimg
            size=nimg.size
        self.size=size
        self.orig_size=orig_size
        self.thumb=PilImageToWxBitmap(image.resize((TILE_WIDTH_PX, TILE_WIDTH_PX)))                             
        self.rotarray={}
        
        for angle in range(0, 360, 5):
            self.rotarray[angle]=PilImageToWxBitmap(image.rotate(angle))
            
    def __str__(self):
        return 'Prop %s' % self.filename
      
    def getImage(self, angle=None):
        if angle==None:
            angle=self.angle
        return self.rotarray[angle]
        
    def paint(self, dc, x, y, angle=None):
        if angle==None:
            angle=self.angle
        dc.DrawBitmap(self.getImage(angle), x, y)
        
    def set(self, x, y):
        app=wx.GetApp()
        prop_instance=PropInstance(self, x-self.size[0]/2, y-self.size[1]/2, self.angle)
        app.level.props.append(prop_instance)
        
    


class Tile:
    def __init__(self, filename):
        self.filename=filename
        self.x=None
        self.y=None
        path=os.path.join(base_tilepath, filename)
        
        if not os.access(path, os.R_OK):
            raise Exception, 'No tile image: %s' % path
        
        image = Image.open(path)
       # image=wx.EmptyImage(pilImage.size[0],pilImage.size[1])
        #image.setData(pil.convert("RGB").tostring())
        #image.setAlphaData(pil.convert("RGBA").tostring()[3::4])
        
        # use the wx.Image or convert it to wx.Bitmap
        self.size=image.size
        if image.size[0]!=TILE_WIDTH_PX or image.size[1]!=TILE_WIDTH_PX:
            thumb=image.resize((TILE_WIDTH_PX, TILE_WIDTH_PX))
        else:
            thumb=image
        self.minimap_image=PilImageToWxBitmap(image.resize(((self.size[0]/TILE_WIDTH_PX)*MINI_MAP_TILE_WIDTH_PX, (self.size[1]/TILE_WIDTH_PX)*MINI_MAP_TILE_WIDTH_PX)))
        self.image = PilImageToWxBitmap(image)
        self.thumb = PilImageToWxBitmap(thumb)
     
    def __str__(self):
        return 'Tile %s' % self.filename
            
    def getId(self):
        return self.filename
    
    
    def set(self, x, y):
        pass #special, handled in map panel paint
    
    def __str__(self):
        self.getId()

        
    

 
class Level:
    
    def __init__(self, size, tiles, props=None, car_positions=None, ai_waypoints=None, checkpoints=None):
        self.size=size
        self.tiles=tiles
        self.props=props or []
        self.car_positions=car_positions or []
        self.ai_waypoints=ai_waypoints or []
        self.checkpoints=checkpoints or []
        
    def getObjects(self):
        retv=[]
        retv.extend(self.props)
        retv.extend(self.car_positions)
        retv.extend(self.ai_waypoints)
        return retv

class TilesetViewPanel(wx.Panel):
    
    def __init__(self, parent, size):
        
        wx.Panel.__init__(self, parent, size=size)
        self.Bind(wx.EVT_PAINT, self.OnPaint)
        self.Bind(wx.EVT_MOUSE_EVENTS, self.OnMouse)
        self.Bind(wx.EVT_ERASE_BACKGROUND, self.EraseBackground)
        self.SetBackgroundStyle(wx.BG_STYLE_CUSTOM)
        
    def EraseBackground(self, e):
        pass
        
    def OnPaint(self, e):
        app=wx.GetApp()
        width, height=self.GetSize()
        dc=wx.AutoBufferedPaintDC(self)
        dc.SetBrush(wx.Brush(wx.Colour(240,240,240)))
        dc.SetPen(wx.Pen(wx.Colour(240,240,240)))
        dc.DrawRectangle(0, 0, self.GetSize()[0], self.GetSize()[1])
        if app.level:

            tiles=app.getTiles()
            cols=max(1, width/50)
            lines=int(math.ceil(float(len(tiles))/float(cols)))
            if height<lines*TILE_WIDTH_PX:
                self.SetSize((width, lines*TILE_WIDTH_PX))
            i=0
 
            for line in range(lines):
                for col in range(cols):
                    if i<len(tiles):
                        tile=tiles[i]
                        x=col*TILE_WIDTH_PX+col*2
                        y=line*TILE_WIDTH_PX+line*2
                        tile.x=x
                        tile.y=y
                        dc.DrawBitmap(tile.thumb, x, y)
                        if(tile==app.selected):
                            dc.SetPen(wx.Pen('blue', 4))
                            dc.DrawLine(x, y, x, y+TILE_WIDTH_PX)
                            dc.DrawLine(x, y, x+TILE_WIDTH_PX, y)
                            dc.DrawLine(x+TILE_WIDTH_PX, y,  x+TILE_WIDTH_PX, y+TILE_WIDTH_PX)
                            dc.DrawLine(x, y+TILE_WIDTH_PX, x+TILE_WIDTH_PX, y+TILE_WIDTH_PX)
                        i+=1
                        
    def OnMouse(self, e):       
        x, y=e.GetPositionTuple()
        #left click: select tile
        if e.LeftUp() and app.level:
            tiles=app.getTiles()
            for tile in tiles:
                if x>=tile.x and x<tile.x+TILE_WIDTH_PX and y>=tile.y and y<tile.y+TILE_WIDTH_PX:
                    app.select(tile)
                    break
        self.Refresh();             


 
  
        
 
class TileSetFrame(wx.Frame):
    
    def __init__(self, parent, title):
        wx.Frame.__init__(self, parent, title=title, size=(300, 500))
        self.SetMinSize((190, 200))
        self.scrolled_window=wx.ScrolledWindow(self, style=wx.VSCROLL)
        self.tsv_panel=TilesetViewPanel(self.scrolled_window, size=(300, 450))
        self.scrolled_window.SetVirtualSize((300, 450))
        self.scrolled_window.SetScrollRate(10, 10)
        self.Bind(wx.EVT_SIZE, self.OnResize )
        self.sizer=wx.BoxSizer(wx.VERTICAL)
        self.sizer.Add(self.scrolled_window,1, wx.EXPAND)
        self.SetSizer(self.sizer)
        self.SetAutoLayout(1)
        self.sizer.Fit(self)
        self.Bind(wx.EVT_CLOSE, self.OnClose)
        self.Show(True)
        
    def OnClose(self, e):
        self.Show(False)
        
    def OnResize(self, e):
        app=wx.GetApp()
        width, height=self.GetSize()
        w=max(TILE_WIDTH_PX, width-TILE_WIDTH_PX)
        tilecount=1
        if app.level:
            tilecount=len(app.getTiles())
        rowc=w/TILE_WIDTH_PX
        min_h=int(math.ceil(float(tilecount)/float(rowc)))*50
        h=max(min_h, height-150)
        self.tsv_panel.SetSize(( w, h))
        self.scrolled_window.SetVirtualSize((w, h))
        e.Skip()
        
 
class MapPanel(wx.Panel):
    
    def __init__(self, parent, size):
        wx.Panel.__init__(self, parent, size=size, pos=(120, 0))
        self.Bind(wx.EVT_PAINT, self.OnPaint)
        self.Bind(wx.EVT_MOUSE_EVENTS, self.OnMouse)
        self.Bind(wx.EVT_ERASE_BACKGROUND, self.EraseBackground)
        self.Bind(wx.EVT_KEY_UP, self.OnKeyUp)
        self.onpanel=False
        self.mousepos=None
        self.SetBackgroundStyle(wx.BG_STYLE_CUSTOM) 
        
    def OnKeyUp(self, e):
        if e.GetKeyCode()==wx.WXK_DELETE:
            wx.GetApp().deleteSelected()
            
    
    def EraseBackground(self, e):
        pass
     
    def OnMouse(self, e):
        refresh=False
        x, y=e.GetPositionTuple()
        app=wx.GetApp()
        self.mousepos=e.GetPositionTuple()
        self.SetFocus()
        if e.Leaving():
            self.onpanel=False
        else:
            self.onpanel=True
        
            
        rot= e.GetWheelRotation()
        if rot>0 and app.selected and isinstance(app.selected, Rotatable):
            for i in range(rot/120):
                app.selected.rotateRight()
        elif rot<0 and app.selected and isinstance(app.selected, Rotatable):
            for i in range(abs(rot)/120):
                app.selected.rotateLeft()
        
        #if selected thing follows mouse, refresh
        if isinstance(app.selected, FollowMouse):
            refresh=True
        
        #deselect on right click
        if e.RightIsDown():
            app.select(None)
            refresh=True
        
        if e.LeftIsDown():
            
            #set tile
            if isinstance(app.selected, Tile):   
                tiles_in_row=app.level.size[0]
                x=x/TILE_WIDTH_PX
                y=y/TILE_WIDTH_PX
                if app.level.tiles[y*tiles_in_row+x]!=app.selected.getId():
                    app.level.tiles[y*tiles_in_row+x]=app.selected.getId()
                    app.refresh()
                    
            
                

            
        if e.LeftDown():
            #set
            x, y=e.GetPositionTuple()
            if app.selected:
                app.selected.set(x, y)

            #nothing selected: try selecting
            if app.selected==None:
                for obj in app.level.getObjects():    
                    if isinstance(obj, Selectable) and  x>=obj.x and x<=obj.x+obj.size[0] and y>=obj.y and y<=obj.y +obj.size[1]:
                        if not app.levelframe.panel_left.layer_props.GetValue() and isinstance(obj, PropInstance):
                            continue
                        if not app.levelframe.panel_left.layer_ai_waypoints.GetValue() and isinstance(obj, AIWaypoint): 
                            continue
                        if not app.levelframe.panel_left.layer_start_positions.GetValue() and isinstance(obj, CarPosition): 
                            continue
                        if not app.levelframe.panel_left.layer_checkpoints.GetValue() and isinstance(obj, Checkpoint): 
                            continue
                        app.select(obj)
                        refresh=True
                        break
                    
        if refresh:
            app.refresh()
            
        #e.Skip()
        
    def OnPaint(self, e):
        #PAINT MAP
        app=wx.GetApp()
        level=app.level
        dc=wx.AutoBufferedPaintDC(self)
        if not level:
            dc.SetBrush(wx.Brush('red'))
            dc.DrawRectangle(0, 0, 800, 800)
        else:
            
            #tiles
            for y in range(level.size[1]-1, -1, -1):
                for x in range(level.size[0]-1, -1, -1):
                    tileid=level.tiles[y*level.size[0]+x]
                    tile=app.tiles[tileid] 
                    dc.DrawBitmap(tile.image, x*TILE_WIDTH_PX, y*TILE_WIDTH_PX)
            
            
            if app.levelframe.panel_left.layer_props.GetValue():  
                #props
                for prop_instance in level.props:
                    prop_instance.paint(dc)
                    
                        
           
            if app.levelframe.panel_left.layer_start_positions.GetValue():
                for pos in level.car_positions:
                    pos.paint(dc)
            
            if app.levelframe.panel_left.layer_ai_waypoints.GetValue():        
                for ai in level.ai_waypoints:
                    ai.paint(dc)
                    
            if app.levelframe.panel_left.layer_checkpoints.GetValue():        
                for c in level.checkpoints:
                    c.paint(dc)
         
        if isinstance(app.selected, Selectable):
            app.selected.paintBox(dc)
          
        #paint selected thing
        if self.onpanel and self.mousepos:
            if isinstance(app.selected, FollowMouse):
                app.selected.paint(dc, self.mousepos[0]-app.selected.size[0]/2, self.mousepos[1]-app.selected.size[1]/2)
            
            if isinstance(app.selected, Checkpoint):
                if app.selected.pt1 and not app.selected.pt2:
                    dc.SetPen(wx.Pen('#FF0000'))
                    dc.SetBrush(wx.Brush('#FF0000', style=wx.TRANSPARENT))
                    dc.DrawRectangle(app.selected.pt1[0], app.selected.pt1[1], self.mousepos[0]-app.selected.pt1[0], self.mousepos[1]-app.selected.pt1[1])

class LeftPanel(wx.Panel):
    
    def __init__(self, parent):
        wx.Panel.__init__(self, parent, size=(200, -1))
        wx.StaticText(self, -1, 'Layers' , wx.Point(15, 10))
        #props
        wx.StaticText(self, -1, 'Props', wx.Point(10, 30))
        self.layer_props=wx.CheckBox(self, -1, pos=(90, 30 ))
        self.layer_props.SetValue(True)
        self.Bind(wx.EVT_CHECKBOX, self.OnLayerClick, self.layer_props)
        
        #ai waypoints
        wx.StaticText(self, -1, 'AI waypoints', wx.Point(10, 50))
        self.layer_ai_waypoints=wx.CheckBox(self, -1, pos=(90, 50 ))
        self.layer_ai_waypoints.SetValue(True)
        self.Bind(wx.EVT_CHECKBOX, self.OnLayerClick, self.layer_ai_waypoints)
        
        #start positions
        wx.StaticText(self, -1, 'Start positions', wx.Point(10, 70))
        self.layer_start_positions=wx.CheckBox(self, -1, pos=(90, 70 ))
        self.layer_start_positions.SetValue(True)
        self.Bind(wx.EVT_CHECKBOX, self.OnLayerClick, self.layer_start_positions)
        
        #checkpoints
        wx.StaticText(self, -1, 'Checkpoints', wx.Point(10, 90))
        self.layer_checkpoints=wx.CheckBox(self, -1, pos=(90, 90 ))
        self.layer_checkpoints.SetValue(True)
        self.Bind(wx.EVT_CHECKBOX, self.OnLayerClick, self.layer_checkpoints)
        
        
        #meta create
        
        #positions
        wx.StaticText(self, -1, 'Car start positions', wx.Point(15, 120))
        self.car_pos_no=wx.TextCtrl(self, -1, pos= (10, 140), size=(30, 20))
        self.car_pos_no.SetValue('1')
        #__init__(self, parent, id, label, pos, size, style, validator, name)
        self.car_pos_btn=wx.Button(self, -1, 'Set', (50, 140))
        self.Bind(wx.EVT_BUTTON, self.OnSetCarPosClick, self.car_pos_btn)
        
        #ai waypoints
        wx.StaticText(self, -1, 'AI waypoints', wx.Point(15, 170))
        self.ai_waypoint_no=wx.TextCtrl(self, -1, pos=(10, 190), size=(30, 20))
        self.ai_waypoint_no.SetValue('1')
        self.ai_waypoint_btn=wx.Button(self, -1, 'Set', (50, 190))
        self.Bind(wx.EVT_BUTTON, self.OnSetAIWaypointPosClick, self.ai_waypoint_btn)
        
        #checkpoints
        wx.StaticText(self, -1, 'Checkpoints', wx.Point(15, 220))
        self.checkpoint_no=wx.TextCtrl(self, -1, pos=(10, 240), size=(30, 20))
        self.checkpoint_no.SetValue('1')
        self.checkpoint_btn=wx.Button(self, -1, 'Set', (50, 240))
        self.Bind(wx.EVT_BUTTON, self.OnSetCheckpointPosClick, self.checkpoint_btn)
        
        #name
        wx.StaticText(self, -1, 'Name', wx.Point(15, 600))
        self.name_box=wx.TextCtrl(self, -1, '', (15,620), size=(150, 20))
    
    def OnSetCheckpointPosClick(self, e):
        app=wx.GetApp()
        no=int(self.checkpoint_no.GetValue())
        c=None
        c=Checkpoint(no, None, None, )            
        app.select(c)
        app.levelframe.mappanel.SetFocus()
        
    def OnSetAIWaypointPosClick(self, e):
        app=wx.GetApp()
        no=int(self.ai_waypoint_no.GetValue())
        waypoint=None
        waypoint=AIWaypoint(no, None, None, )            
        app.select(waypoint)
        app.levelframe.mappanel.SetFocus()
        
    def OnSetCarPosClick(self, e):
        app=wx.GetApp()
        pos=int(self.car_pos_no.GetValue())
        position=None
        for p in app.level.car_positions:
            if p.pos==pos:
                position=p
                break
        else:
            position=CarPosition(pos, None, None, 0)
            
        app.select(position)
        app.levelframe.mappanel.SetFocus()
        
    def OnLayerClick(self, e):
        app=wx.GetApp()
        app.refresh()
 
class MiniMapFrame(wx.Frame):
    
    class MiniMapPanel(wx.Panel):
        
        def __init__(self, parent, size):
            wx.Panel.__init__(self, parent, size=size, pos=(120, 0))
            self.Bind(wx.EVT_PAINT, self.OnPaint)
            self.Bind(wx.EVT_ERASE_BACKGROUND, self.EraseBackground)
            self.SetBackgroundStyle(wx.BG_STYLE_CUSTOM)
            
        def EraseBackground(self, e):
            pass
        
        def OnPaint(self, e):
            #PAINT MAP
            app=wx.GetApp()
            level=app.level
            dc=wx.AutoBufferedPaintDC(self)
        
             #tiles
            for y in range(level.size[1]-1, -1, -1):
                for x in range(level.size[0]-1, -1, -1):
                    tileid=level.tiles[y*level.size[0]+x]
                    tile=app.tiles[tileid] 
                    dc.DrawBitmap(tile.minimap_image, x* MINI_MAP_TILE_WIDTH_PX, y*MINI_MAP_TILE_WIDTH_PX)

    
    def __init__(self, parent):
        wx.Frame.__init__(self, parent, title='Mini map', size=(50, 50), style=wx.CAPTION | wx.CLOSE_BOX)
        self.mappanel=MiniMapFrame.MiniMapPanel(self, (MINI_MAP_TILE_WIDTH_PX*20, MINI_MAP_TILE_WIDTH_PX*20))
        self.sizer=wx.BoxSizer(wx.VERTICAL)
        self.sizer.Add(self.mappanel, 0, wx.EXPAND)   
        self.SetSizer(self.sizer)
        self.SetAutoLayout(1)
        self.sizer.Fit(self)
        self.Show(True)
        

class LevelFrame(wx.Frame):
    
    def __init__(self, parent, title):
        wx.Frame.__init__(self, parent, title=title, size=(500, 500), pos=(0, 200))      
        #INIT MENU
        #filemenu
        filemenu=wx.Menu()
        menu_item_new = filemenu.Append(wx.ID_NEW,  "&New",  " Start new level")
        menu_item_open= filemenu.Append(wx.ID_OPEN, "&Open", " Open a level" )
        menu_item_save= filemenu.Append(wx.ID_SAVE, "&Save", " Save current level")
        menu_item_exit= filemenu.Append(wx.ID_EXIT, "E&xit", " Exit program")
        self.Bind(wx.EVT_MENU, self.OnExit, menu_item_exit)
        self.Bind(wx.EVT_MENU, self.OnOpen, menu_item_open)
        self.Bind(wx.EVT_MENU, self.OnSave, menu_item_save)
        self.Bind(wx.EVT_MENU, self.OnNew,  menu_item_new)
        self.Bind(wx.EVT_KEY_UP, self.OnKeyUp)
        
        #viewmenu
        viewmenu=wx.Menu()       
        menu_item_view_tileset=viewmenu.Append(-1, "&Tileset", " View tileset")
        self.Bind(wx.EVT_MENU, self.ViewTileset, menu_item_view_tileset)
        
        #tools menu
        toolsmenu=wx.Menu()
        menu_item_clear_waypoints=toolsmenu.Append(-1, '&Clear waypoints', ' Clear AI waypoints')
        self.Bind(wx.EVT_MENU, self.ClearWaypoints, menu_item_clear_waypoints)
        menu_item_compile_resources=toolsmenu.Append(-1, 'Compile resources.js', 'Compile resources.js')
        self.Bind(wx.EVT_MENU, self.CompileResources, menu_item_compile_resources)
        
        menu_item_compile_levels=toolsmenu.Append(-1, 'Compile levels.js', 'Compile levels.js');
        self.Bind(wx.EVT_MENU, self.CompileLevels, menu_item_compile_levels);
        
        menu_item_fill=toolsmenu.Append(-1, 'Fill w. selected tile', 'Fill bg with selected tile')
        self.Bind(wx.EVT_MENU, self.FillTile, menu_item_fill)
        #menubar
        menuBar=wx.MenuBar()
        menuBar.Append(filemenu, "&File")
        menuBar.Append(viewmenu, "&View")
        menuBar.Append(toolsmenu, "&Tools")
        
        self.SetMenuBar(menuBar)
        #close event
        self.Bind(wx.EVT_CLOSE, self.OnExit)
        
        #SCROLLED WINDOW
        self.scrolled_window=wx.ScrolledWindow(self)   
        self.mappanel=MapPanel(self.scrolled_window, size=(800, 800))
        
        self.scrolled_window.SetVirtualSize((800, 800))
        self.scrolled_window.SetScrollRate(10, 10)
        #MAIN SIZER
        self.sizer=wx.BoxSizer(wx.HORIZONTAL)
        #left panel
        self.panel_left=LeftPanel(self)
        
        
        self.sizer.Add(self.panel_left, 0, wx.EXPAND)
        self.sizer.Add(self.scrolled_window, 1, wx.EXPAND)     
        self.SetSizer(self.sizer)
        self.SetAutoLayout(1)
        self.sizer.Fit(self)
        self.Show(True)
        
    def FillTile(self, e):
        app=wx.GetApp()
        if isinstance(app.selected, Tile):
            app.level.tiles=[app.selected.filename for x in range(len(app.level.tiles))]
            app.refresh()
            
    def CompileLevels(self, e):
        levels=os.listdir('levels');
        out="""exports.levels={%s};""" % ','.join(["'%s':require('./levels/%s')" % (x[:-3], x[:-3]) for x in levels]);
        f=open('levels.js', 'w')
        f.write(out)
        f.close()
        
    def CompileResources(self, e):
        props=os.listdir('images/props')
        cars=os.listdir('images/cars')
        tiles=os.listdir('images/tiles')
        animations=os.listdir('images/animations')
        ui=os.listdir('images/ui')
        static=os.listdir('images/static')
        out="""exports.props=%s;
        exports.cars=%s;
        exports.tiles=%s;
        exports.animations=%s;
        exports.ui=%s;
        exports.static=%s;""" % (props, cars, tiles, animations, ui, static)
        f=open('resources.js', 'w')
        f.write(out.replace('\t', '').replace(' ', ''))
        f.close()
        
    
    def ClearWaypoints(self, e):
        app=wx.GetApp()
        app.level.ai_waypoints=[]
        app.refresh()
        
    def OnKeyUp(self, e):
        if e.GetKeyCode()==wx.WXK_DELETE:
            wx.GetApp().deleteSelected()
    def OnNew(self, e):
        dlg = NewLevelDialog(None, -1)
        dlg.ShowModal()
                
    def OnExit(self, e):
        exit() 
        self.Close(True)
        
    def OnSave(self, e):
        dirname=''
        dialog=wx.FileDialog(self, "Choose a file", dirname, "", "*.js", wx.FD_SAVE)
        if dialog.ShowModal() == wx.ID_OK:
            filename = dialog.GetFilename()
            dirname = dialog.GetDirectory()
            app=wx.GetApp()
            app.save(os.path.join(dirname, filename))
        dialog.Destroy()
        

    def OnOpen(self, e):
        dirname=''
        dialog=wx.FileDialog(self, "Choose a file", dirname, "", "*.js", wx.OPEN)
        if dialog.ShowModal() == wx.ID_OK:
            filename = dialog.GetFilename()
            dirname = dialog.GetDirectory()
            app=wx.GetApp()
            app.load(os.path.join(dirname, filename))
        dialog.Destroy()
        
    def ViewTileset(self, e):
        wx.GetApp().tilesetframe.Show(True)


class NewLevelDialog(wx.Dialog):
    def __init__(self, parent, id):
        wx.Dialog.__init__(self, parent, id, 'New level', size=(250, 150))

        panel = wx.Panel(self, -1)
        vbox = wx.BoxSizer(wx.VERTICAL)

        wx.StaticText(panel, -1, 'Width' , wx.Point(10, 20))
        wx.StaticText(panel, -1, 'Height' , wx.Point(10, 60))
     
        self.txt_width=wx.TextCtrl(panel, -1, '', (95, 20))
        self.txt_height=wx.TextCtrl(panel, -1, '', (95,60))
        self.txt_width.SetValue('50')
        self.txt_height.SetValue('50')

        hbox = wx.BoxSizer(wx.HORIZONTAL)
        okButton = wx.Button(self, -1, 'Ok', size=(70, 30))
        closeButton = wx.Button(self, -1, 'Cancel', size=(70, 30))
        hbox.Add(okButton, 1)
        hbox.Add(closeButton, 1, wx.LEFT, 5)

        vbox.Add(panel)
        vbox.Add(hbox, 1, wx.ALIGN_CENTER | wx.TOP | wx.BOTTOM, 10)

        self.SetSizer(vbox)
        
        self.Bind(wx.EVT_BUTTON, self.ok, okButton)
        self.Bind(wx.EVT_BUTTON, self.cancel, closeButton)
    
    def ok(self, e):
        app=wx.GetApp()
        width=int(self.txt_width.GetValue())
        height=int(self.txt_height.GetValue())
        tiles=['grass.png' for x in range(width*height)]
        level=Level((width, height), tiles)
        app.loadLevel(level)
        self.Destroy()
    
    def cancel(self, e):
        self.Destroy()









class PropsetViewPanel(wx.Panel):
    
    def __init__(self, parent, size):
        
        wx.Panel.__init__(self, parent, size=size)
        self.Bind(wx.EVT_PAINT, self.OnPaint)
        self.Bind(wx.EVT_MOUSE_EVENTS, self.OnMouse)
        self.Bind(wx.EVT_ERASE_BACKGROUND, self.EraseBackground)
        self.SetBackgroundStyle(wx.BG_STYLE_CUSTOM)
        
    def EraseBackground(self, e):
        pass
        
    def OnPaint(self, e):
        app=wx.GetApp()
        width, height=self.GetSize()
        dc=wx.AutoBufferedPaintDC(self)
        dc.SetBrush(wx.Brush(wx.Colour(240,240,240)))
        dc.SetPen(wx.Pen(wx.Colour(240,240,240)))
        dc.DrawRectangle(0, 0, self.GetSize()[0], self.GetSize()[1])
        if app.level:

            props=app.getProps()
            cols=max(1, width/TILE_WIDTH_PX)
            lines=int(math.ceil(float(len(props))/float(cols)))
            if height<lines*TILE_WIDTH_PX:
                self.SetSize((width, lines*TILE_WIDTH_PX))
            i=0
 
            for line in range(lines):
                for col in range(cols):
                    if i<len(props):
                        prop=props[i]
                        x=col*TILE_WIDTH_PX+col*2
                        y=line*TILE_WIDTH_PX+line*2
                        prop.x=x
                        prop.y=y
                        dc.DrawBitmap(prop.thumb, x, y)
                        if(prop==app.selected):
                            dc.SetPen(wx.Pen('blue', 4))
                            dc.DrawLine(x, y, x, y+TILE_WIDTH_PX)
                            dc.DrawLine(x, y, x+TILE_WIDTH_PX, y)
                            dc.DrawLine(x+TILE_WIDTH_PX, y,  x+TILE_WIDTH_PX, y+TILE_WIDTH_PX)
                            dc.DrawLine(x, y+TILE_WIDTH_PX, x+TILE_WIDTH_PX, y+TILE_WIDTH_PX)
                        i+=1
                        
    def OnMouse(self, e):       
        x, y=e.GetPositionTuple()
        #left click: select tile
        if e.LeftUp() and app.level:
            props=app.getProps()
            for prop in props:
                if x>=prop.x and x<prop.x+TILE_WIDTH_PX and y>=prop.y and y<prop.y+TILE_WIDTH_PX:
                    app.select(prop)
                    app.levelframe.mappanel.SetFocus()
                    app.levelframe.panel_left.layer_props.SetValue(True)
                    app.refresh()
                    break
        self.Refresh();             


 
  
        
 
class PropSetFrame(wx.Frame):
    
    def __init__(self, parent, title):
        wx.Frame.__init__(self, parent, title=title, size=(300, 500))
        self.SetMinSize((190, 200))    
        self.scrolled_window=wx.ScrolledWindow(self, style=wx.VSCROLL)
        self.psv_panel=PropsetViewPanel(self.scrolled_window, size=(300, 450))
        self.scrolled_window.SetVirtualSize((300, 450))
        self.scrolled_window.SetScrollRate(10, 10)
        self.Bind(wx.EVT_SIZE, self.OnResize )
        
        self.sizer=wx.BoxSizer(wx.VERTICAL)
        self.sizer.Add(self.scrolled_window,1, wx.EXPAND)
        self.SetSizer(self.sizer)
        self.SetAutoLayout(1)
        self.sizer.Fit(self)
        self.Bind(wx.EVT_CLOSE, self.OnClose)
        self.Show(True)
        
    def OnClose(self, e):
        self.Show(False)
        
    def OnResize(self, e):
        app=wx.GetApp()
        width, height=self.GetSize()
        w=max(TILE_WIDTH_PX, width-TILE_WIDTH_PX)
        propcount=1
        if app.level:
            propcount=len(app.getProps())
        rowc=w/TILE_WIDTH_PX
        min_h=int(math.ceil(float(propcount)/float(rowc)))*50
        h=max(min_h, height-150)
        self.psv_panel.SetSize(( w, h))
        self.scrolled_window.SetVirtualSize((w, h))
        e.Skip()
        
        
class EditorApp(wx.App):
    def __init__(self):
        self.level=None
        wx.App.__init__(self, False)
        
        #load tiles
        tiles={}
        for filename in os.listdir(base_tilepath):
            if filename.split('.')[-1]=='png':
                tiles[filename]=Tile(filename)
        self.tiles=tiles
        
        #load props      
        props={}
        for filename in os.listdir(base_proppath):
            if filename.split('.')[-1]=='png':
                props[filename]=Prop(filename)
        self.props=props
        
        self.levelframe=LevelFrame(None, 'Level editor')
        self.tilesetframe=TileSetFrame(None, 'Tiles')
        self.propsetframe=PropSetFrame(None, 'Props')
        self.minimapframe=MiniMapFrame(None)
        self.loadInitLevel()
        
        self.selected=None
        
    def getTiles(self):
        return [self.tiles[key] for key in self.tiles]
        
    def getProps(self):
        return [self.props[key] for key in self.props]
        
    def save(self, path):
        
        
        dict={}
        rev_dict={}
        def trans(x):
            if not rev_dict.has_key(x):
                if not dict:
                    key=1
                else:
                    key=max(dict.keys())+1
                dict[key]=x
                rev_dict[x]=key
            else:
                key=rev_dict[x]
            return key
        
        if self.level:
            tiles=[]
            for x in self.level.tiles:
                if x=='cross.png':
                    x=''
                tiles.append(x)
                     
            retv={'width_t':self.level.size[0],
                  'height_t':self.level.size[1],
                  'tiles':[trans(x) for x in tiles],
                  'name':self.levelframe.panel_left.name_box.GetValue(),
                  'props':[{'f':trans(p.prop.filename),
                            'x':p.x,
                            'y':p.y,
                            'a':p.angle,
                            'opx':p.prop.size[0],
                            'ws':getWorldSize(p.prop.orig_size)} for p in self.level.props],
                  'car_positions':[{'pos':p.pos,
                                    'x':p.x,
                                    'y':p.y,
                                    'angle':p.angle} for p in self.level.car_positions],
                  'ai_waypoints':[{'no':p.no,
                                   'x':p.x,
                                   'y':p.y} for p in self.level.ai_waypoints],
                  'checkpoints':[{'no':p.no,
                                  'pt1':p.pt1,
                                  'pt2':p.pt2} for p in self.level.checkpoints]}
            retv['dict']=dict
            out='exports.data=%s;\n' % simplejson.dumps(retv)
            f=open(path, 'w')
            f.write(out);
            f.close()
            
    def load(self, path):
        f=open(path, 'r');
        lvl=f.read()
        f.close()
        lvl=simplejson.loads(lvl[13:-2])
        dict=lvl['dict']
        tiles=[]
        for x in lvl['tiles']:
            x=dict[str(x)]
            if x=='':
                x='cross.png'
            tiles.append(x)
        
        size=(lvl['width_t'], lvl['height_t'])
    
        props=[]
        car_positions=[]
        ai_waypoints=[]
        checkpoints=[]
        if lvl.has_key('props'):
            props=[PropInstance(app.props[dict[str(p['f'])]], p['x'], p['y'], p['a']) for p in lvl['props']]
            
        if lvl.has_key('car_positions'):
            car_positions=[CarPosition(x['pos'], x['x'], x['y'], x['angle']) for x in lvl['car_positions']]
        
        if lvl.has_key('ai_waypoints'):
            ai_waypoints=[AIWaypoint(x['no'], x['x'], x['y']) for x in lvl['ai_waypoints']]
            
        if lvl.has_key('checkpoints'):
            checkpoints=[Checkpoint(x['no'], x['pt1'], x['pt2']) for x in lvl['checkpoints']]
            
        self.levelframe.panel_left.name_box.SetValue(lvl.get('name') or '')
            
        self.loadLevel(Level(size, tiles, props, car_positions, ai_waypoints, checkpoints))
        
        
    def loadLevel(self, level):
        self.level=level
        size=(level.size[0]*TILE_WIDTH_PX, level.size[1]*TILE_WIDTH_PX)
        self.levelframe.scrolled_window.SetVirtualSize(size)
        self.levelframe.mappanel.SetSize(size)
        self.levelframe.mappanel.Refresh()
        minimap_size=(level.size[0]*MINI_MAP_TILE_WIDTH_PX, level.size[1]*MINI_MAP_TILE_WIDTH_PX+20)
        self.minimapframe.SetSize(minimap_size)
        self.minimapframe.mappanel.SetSize(minimap_size)
        if level.car_positions:
            pos=max([x.pos for x in level.car_positions])+1
        else:
            pos=1
            
        if level.ai_waypoints:
            no=max([x.no for x in level.ai_waypoints])+1
        else:
            no=1
            
        if level.checkpoints:
            cno=max([x.no for x in level.checkpoints])+1
        else:
            cno=1
            
        self.levelframe.panel_left.car_pos_no.SetValue(str(pos))
        self.levelframe.panel_left.ai_waypoint_no.SetValue(str(no))
        self.levelframe.panel_left.checkpoint_no.SetValue(str(cno))
        
    def select(self, obj):
        if self.selected and hasattr(self.selected, 'unselect'):
            self.selected.unselect()
        self.selected=obj
        
    def refresh(self):
        self.levelframe.mappanel.Refresh()
        self.tilesetframe.tsv_panel.Refresh()
        self.propsetframe.psv_panel.Refresh()
        self.minimapframe.mappanel.Refresh()
    
    def loadInitLevel(self):
        tiles=['grass.png' for x in range(20*20)]
        self.loadLevel(Level((20, 20), tiles))
        
    def deleteSelected(self):
        if hasattr(self.selected, 'delete'):
            self.selected.delete()
        
app=EditorApp()
app.MainLoop()
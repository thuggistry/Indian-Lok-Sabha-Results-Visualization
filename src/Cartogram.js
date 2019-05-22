import React, { Component } from 'react';
import * as d3 from 'd3';
import 'd3-selection-multi';
import data from './data_combined.json';

const colors = {
  "Party":{
    "ADMK":"#a1c2bf",
    "AITC":"#66ff00",
    "BJD":"#02a41d",
    "BJP":"#fd9a3e",
    "BSP":"#3e3eff",
    "CPM":"#e6452e",
    "DMK":"#1260e8",
    "INC":"#00e1e1",
    "JD(U)":'#f7c839',
    "JKN":"#012970",
    "JKPDP":"#0abc3d",
    "LJP":"#eb8be5",
    "NCP":"#177da4",
    "RJD":"#87ce92",
    "SAD":"#666633",
    "SHS":"#ff5500",
    "SP":"#ff7570",
    "TDP":"#ebfd36",
    "TRS":"#f84996",
    "YSRCP":"#0e67b1",
    "Independent & Others":"#ddd"
  },
  "Alliance":{
    'NDA':"#fd9a3e",
    'UPA':'#00e1e1',
    'Third_Front':'#c10000',
    'Forth_Front':'#ff7570',
    'Communist_Parties':'#c10000',
    'Others':'#ddd'

  }
}

const radius = 10.5;
const h = 1.5 * radius / Math.cos (Math.PI / 6)

let Result_All_years,Result_Alliance_years;

let getHexPoints = (cx,cy, rad) => {
  let path = `M${cx + rad} ${cy - rad / Math.tan(Math.PI / 3)} L ${cx + rad} ${cy + rad / Math.tan(Math.PI / 3)} L ${cx} ${cy + radius / Math.cos (Math.PI / 6)} L ${cx - rad} ${cy + rad / Math.tan(Math.PI / 3)} L ${cx - rad} ${cy - rad / Math.tan(Math.PI / 3)} L ${cx} ${cy - radius / Math.cos (Math.PI / 6)} Z`
  return path
}

const marginScale = d3.scaleLinear()
  .domain([0,33.33,66.66,100])
  .range(['#ffffd9','#c7e9b4','#1d91c0','#071d58'])
const turnOutScale = d3.scaleLinear()
  .domain([30,50,70,90])
  .range(['#ffffd9','#c7e9b4','#1d91c0','#071d58'])

class Cartogram extends Component {
  constructor(props){
    super(props)
    this.state = {
    }
  }
  componentDidUpdate(){
    d3.selectAll('.hex')
      .attrs({
        'fill':d => {
          switch(this.props.filterSelected){
            case 'Voter TurnOut':
              return turnOutScale(d[`${this.props.yearSelected}-Result`]['VotersInfo']['TurnOutPercentage'])
            case 'Margin of Victory':
              return marginScale((d[`${this.props.yearSelected}-Result`]['1']['Votes'] - d[`${this.props.yearSelected}-Result`]['2']['Votes']) * 100/d[`${this.props.yearSelected}-Result`]['1']['Votes']);
            default:
              if(Object.keys(colors[this.props.allianceSelected]).indexOf(d[`${this.props.yearSelected}-Result`]['1'][this.props.allianceSelected]) > -1){
                return colors[this.props.allianceSelected][d[`${this.props.yearSelected}-Result`]['1'][this.props.allianceSelected]]
              }
              return colors["Party"]["Independent & Others"]
          }
        }
      })
    if((this.props.filterSelected === 'Voter TurnOut') || (this.props.filterSelected === 'Margin of Victory')) {
      d3.selectAll('.colorLegend')
        .attrs({'opacity': 1})
      if(this.props.filterSelected === 'Voter TurnOut'){
        d3.selectAll('.marginLegendText')
          .attrs({ 'opacity': 0});
        d3.selectAll('.turnoutLegendText')
          .attrs({ 'opacity': 1})
      } else {
        d3.selectAll('.marginLegendText')
          .attrs({ 'opacity': 1});
        d3.selectAll('.turnoutLegendText')
          .attrs({ 'opacity': 0})
      }
    } else {
      d3.selectAll('.colorLegend')
        .attrs({'opacity': 0})
    }
    d3.selectAll('.ConstituencyGroup')
      .attrs({
        'opacity':d => {
          switch(this.props.filterSelected){
            case 'All':
              return 1;
            case 'Female Winners':
              if (d[`${this.props.yearSelected}-Result`]['1']['Sex'] === 'F')
                return 1
              return 0.05;
            case 'SC/ST Winner':
              if (d[`${this.props.yearSelected}-Result`]['1']['Caste'] !== 'GEN')
                return 1
              return 0.05;
            default:
              return 1;
          }
        }
      })
    this.createInfoBar() 
  }
  
  mouseMove = (event) => {
    d3.selectAll('.tooltip')
      .style('top',`${event.pageY - 30}px`)
      .style('left',`${event.pageX + 10}px`)
  }
  mouseOver = (d,event) => {
    d3.selectAll('.ConstituencyGroup')
      .attr('opacity', 0.2)
    d3.selectAll(`.${d.State}Group`)
      .attr('opacity', 1)
    d3.selectAll('.stateName')
      .text(`${d.stateFullName} - ${d.Name}`)
    d3.selectAll('.mapG')
      .append('path')
      .attrs({
        'd':getHexPoints(d['Coordinate'][0] * radius, d['Coordinate'][1] * h, radius),
        'class':'hexHighlight',
        'stroke':'#000',
        'stroke-opacity':'1',
        'stroke-width':'2',
        'fill': "none"
      })
    d3.selectAll('.tooltip')
      .style('display','inline')
      .style('top',`${event.pageY - 30}px`)
      .style('left',`${event.pageX + 10}px`)
    d3.selectAll('.const_Name')
      .html(`${d.Name} (${d.State})`)
    d3.selectAll('.Voter_Turnout_Value')
      .html(`${d[`${this.props.yearSelected}-Result`]['VotersInfo']['TurnOutPercentage']}%`)
    d3.selectAll('.Winner_Name')
      .html(`${d[`${this.props.yearSelected}-Result`]['1']['Name']}`)
    d3.selectAll('.Winner_Party')
    .html(`${d[`${this.props.yearSelected}-Result`]['1']['Party']}`)
    d3.selectAll('.Category_Name')
      .html(`${d[`${this.props.yearSelected}-Result`]['1']['Sex']} · ${d[`${this.props.yearSelected}-Result`]['1']['Caste']}`)
    d3.selectAll('.Margin_Percent_Value')
      .html(`${((d[`${this.props.yearSelected}-Result`]['1']['Votes'] - d[`${this.props.yearSelected}-Result`]['2']['Votes']) * 100/d[`${this.props.yearSelected}-Result`]['1']['Votes']).toFixed(1)}%`)
  }
  mouseLeave = () => {
    d3.selectAll('.hexHighlight').remove()
    d3.selectAll('.tooltip')
      .style('display','none')
    d3.selectAll(`.hex`)
      .attrs ({
        'stroke':'#fff',
        'stroke-opacity':'0.6',
        'stroke-width':'1',
      })
    d3.selectAll('.ConstituencyGroup')
      .attrs({
        'opacity':d => {
          switch(this.props.filterSelected){
            case 'Female Winners':
              if (d[`${this.props.yearSelected}-Result`]['1']['Sex'] === 'F')
                return 1
              return 0.2;
            case 'SC/ST Winner':
              if (d[`${this.props.yearSelected}-Result`]['1']['Caste'] !== 'GEN')
                return 1
              return 0.2;
            default:
              return 1;
          }
        }
      })
    d3.selectAll('.stateName')
      .text('India')
    d3.selectAll('.reservedIcon')
      .attrs({ 'opacity':1 })
    
  }
  componentDidMount(){

    let width = window.innerWidth * 2 / 3, height = 820;
    if(window.innerWidth > 1272) {
      width = 1272 * 2/3
    }
    let Result_2014 = d3.nest()
      .key(d => d[`2014-Result`]['1']['Party'])
      .rollup(v => v.length)
      .entries(data);
    let Result_Alliance_2014 = d3.nest()
      .key(d => d[`2014-Result`]['1']['Alliance'])
      .rollup(v => v.length)
      .entries(data);
    let Result_Alliance_Parties_2014 = d3.nest()
      .key(d => d[`2014-Result`]['1']['Alliance'])
      .key(d => d[`2014-Result`]['1']['Party'])
      .rollup(v => v.length)
      .entries(data);
    // eslint-disable-next-line
    let Result_StateWise_2014 = d3.nest()
      .key(d => d[`stateFullName`])
      .key(d => d[`2014-Result`]['1']['Party'])
      .rollup(v => v.length)
      .entries(data);
    let Result_2009 = d3.nest()
      .key(d => d[`2009-Result`]['1']['Party'])
      .rollup(v => v.length)
      .entries(data);
    let Result_Alliance_2009 = d3.nest()
      .key(d => d[`2009-Result`]['1']['Alliance'])
      .rollup(v => v.length)
      .entries(data);
    let Result_Alliance_Parties_2009 = d3.nest()
      .key(d => d[`2009-Result`]['1']['Alliance'])
      .key(d => d[`2009-Result`]['1']['Party'])
      .rollup(v => v.length)
      .entries(data);
    // eslint-disable-next-line
    let Result_StateWise_2009 = d3.nest()
      .key(d => d[`stateFullName`])
      .key(d => d[`2009-Result`]['1']['Party'])
      .rollup(v => v.length)
      .entries(data);
    Result_Alliance_2009 = Result_Alliance_2009.filter(d => d.value > 0).sort((a, b) => d3.descending(a.value, b.value))
    Result_Alliance_2014 = Result_Alliance_2014.filter(d => d.value > 0).sort((a, b) => d3.descending(a.value, b.value))
    Result_Alliance_2014 = Result_Alliance_2014.map(d => {
      Result_Alliance_Parties_2014.forEach(el => {
        if(d.key === el.key){
          d.Party = el.values
        }
      })
      d.Party = d.Party.sort((a, b) => d3.descending(a.value, b.value))
      d.Party = d.Party.map(el => {
        el.Alliance = d.key
        return el;
      })
      return d
    })
    Result_Alliance_2009 = Result_Alliance_2009.map(d => {
      Result_Alliance_Parties_2009.forEach(el => {
        if(d.key === el.key)
          d.Party = el.values
      })
      d.Party = d.Party.sort((a, b) => d3.descending(a.value, b.value))
      d.Party = d.Party.map(el => {
        el.Alliance = d.key
        return el;
      })
      return d
    })

    Result_All_years={
      '2009':Result_2009.sort((a, b) => d3.descending(a.value, b.value)),
      '2014':Result_2014.sort((a, b) => d3.descending(a.value, b.value))
    }
    Result_Alliance_years={
      '2009':Result_Alliance_2009,
      '2014':Result_Alliance_2014
    }
    let svg = d3.selectAll('.map')
      .append('svg')
      .attrs({
        'width':width,
        'height':height,
        'class':'mapSVG' 
      })
      .append('g')
      .attrs({ 
        'transform':'translate(20,70)',
        'class':'mapG' 
      })

    let stateList = d3.map(data, d => d.State).keys()
    stateList.forEach((el,k) => {
      svg.selectAll(`.${el}`)
        .data(data.filter(d => d.State === el))
        .enter()
        .append('path')
        .attrs({
          'class':d => `${d.State} hexOutline`,
          'd': d => getHexPoints(d['Coordinate'][0] * radius, d['Coordinate'][1] * h, radius),
          'fill':'none',
          'stroke':'#000',
          'stroke-width':'3'
        })
        .on("mouseover",d => {
          this.mouseOver(d,d3.event)
        })
        .on('mousemove',d => {
          this.mouseMove(d3.event)
        })
        .on("mouseout",this.mouseLeave)
      svg.selectAll(`.${el}BG`)
        .data(data.filter(d => d.State === el))
        .enter()
        .append('path')
        .attrs({
          'class':d => `${d.State}BG`,
          'd':d => getHexPoints(d['Coordinate'][0] * radius, d['Coordinate'][1] * h, radius),
          'stroke':'#fff',
          'stroke-opacity':'0.6',
          'stroke-width':'1',
          'fill':'#fff'
        })      
      
      svg.selectAll(`.${el}Group`)
        .data(data.filter(d => d.State === el))
        .enter()
        .append('g')
        .attrs({ 
          'class':d => {
            return `Year_2014_${d[`2014-Result`]['1']['Party'].replace("(", "_").replace("(", "_").replace(")", "_").replace(")", "_")} Year_2009_${d[`2009-Result`]['1']['Party'].replace("(", "_").replace("(", "_").replace(")", "_").replace(")", "_")} State_${d.State} ConstituencyGroup ${el}Group`
          } 
        })
        .on("mouseover",d => {
          this.mouseOver(d,d3.event)
        })
        .on('mousemove',d => {
          this.mouseMove(d3.event)
        })
        .on("mouseout",this.mouseLeave)      
    })

    d3.selectAll('.ConstituencyGroup')
      .append('path')
      .attrs({
        'd':d => getHexPoints(d['Coordinate'][0] * radius, d['Coordinate'][1] * h, radius),
        'class':d => `hex state_${d.State}_const_${d['Constituency No']}`,
        'stroke':'#fff',
        'stroke-opacity':'0.6',
        'stroke-width':'1',
        'fill': d => {
          if(Object.keys(colors[this.props.allianceSelected]).indexOf(d[`${this.props.yearSelected}-Result`]['1'][this.props.allianceSelected]) > -1){
            return colors[this.props.allianceSelected][d[`${this.props.yearSelected}-Result`]['1'][this.props.allianceSelected]]
          }
          return colors["Party"]["Independent & Others"]
        }
      })

      d3.selectAll('.ConstituencyGroup')
        .append('circle')
        .attrs({
          'cx':d => d['Coordinate'][0] * radius,
          'cy':d => d['Coordinate'][1] * h,
          'r':d => {
            if(d['Reserved'] !== 'None')
              return 3
            return 0
          },
          'fill':'#000'
        })

      let keyG = svg.append('g')
        .attrs({ 'transform':'translate(375,650)'})
      
      keyG.append('circle')
        .attrs({
          'fill': '#000',
          'r':5,
          'cx':0,
          'cy':60
        })
      keyG.append('text')
        .text('Seats Reserved for SC/ST')
        .attrs({
          'fill': '#000',
          'x':10,
          'y':65,
          'font-weight':700
        })
      
      let colorLegend = keyG.append('g')
        .attrs({ 
          'class':'colorLegend',
          'transform':'translate(0,0)',
          'opacity':0  
        })
      
      

      let linearGradient = d3.selectAll('.mapSVG')
          .append("defs")
          .append("linearGradient")
          .attrs({"id":"linear-gradient"});

      linearGradient.append("stop")
        .attrs({
          "offset":"0%",
          "stop-color":"#ffffd9"
        });

      linearGradient.append("stop")
        .attrs({
          "offset":"33.33%",
          "stop-color":'#c7e9b4'
        });

      linearGradient.append("stop")
        .attrs({
          "offset":"66.67%",
          "stop-color":'#1d91c0'
        });

      linearGradient.append("stop")
        .attrs({
          "offset":"100%",
          "stop-color":'#071d58'
        });

      colorLegend.append('rect')
        .attrs({
          'x':-5,
          'y':0,
          'width':250,
          'height':20,
          'fill':"url(#linear-gradient)",
          'stroke':'#ccc'
        })
      colorLegend.append('text')
        .attrs({
          'x':-5,
          'y':35,
          'class':'marginLegendText',
          'font-weight':'700',
          'opacity':0
        })
        .text('0%')
      colorLegend.append('text')
        .attrs({
          'x':245,
          'y':35,
          'class':'marginLegendText',
          'text-anchor':'end',
          'font-weight':'700',
          'opacity':0
        })
        .text('100%')
      
      colorLegend.append('text')
        .attrs({
          'x':-5,
          'y':35,
          'class':'turnoutLegendText',
          'font-weight':'700',
          'opacity':0
        })
        .text('30%')
      colorLegend.append('text')
        .attrs({
          'x':245,
          'y':35,
          'class':'turnoutLegendText',
          'text-anchor':'end',
          'font-weight':'700',
          'opacity':0
        })
        .text('90%')
      this.createInfoBar();
  }

  createInfoBar = () => {
    d3.selectAll('.barChart').remove();
    let info = d3.selectAll('.infoSection')
                  .append('div')
                  .attrs({ 'class':'barChart' })
    
    info.selectAll('.partyBars')
      .data(Result_All_years[this.props.yearSelected])
      .enter()
      .append('div')
      .attrs({ 'class':'partyBars' })
      .on('mouseover',d => {
        d3.selectAll('.ConstituencyGroup')
          .attrs({ 'opacity': 0.05 })
        d3.selectAll(`.Year_${this.props.yearSelected}_${d.key.replace("(", "_").replace("(", "_").replace(")", "_").replace(")", "_")}`)
          .attrs({ 'opacity': 1 })
      })
      .on('mouseout',this.mouseLeave)
    
    info.selectAll('.partyBars')
      .append('div')
      .attrs({ 'class':'partyNames' })
      .html(d => d.key)
    
    info.selectAll('.partyBars')
      .append('div')
      .attrs({ 'class':'partyBarBG' })
    info.selectAll('.partyBarBG')
      .append('div')
      .style('width',d => `${d.value * 100/ 543}%`)
      .style('background-color',d => {
        if(Object.keys(colors['Party']).indexOf(d['key']) > -1){
          return colors['Party'][d['key']]
        }
        return colors["Party"]["Independent & Others"]
      })
    info.selectAll('.partyBarBG')
      .append('div')
      .attrs({'class':'seatShare'})
      .html(d => `${d.value} (${(d.value*100/543).toFixed(1)}%)`)
    
    info.selectAll('.AllianceBars')
      .data(Result_Alliance_years[this.props.yearSelected])
      .enter()
      .append('div')
      .attrs({ 'class':'AllianceBars' })
      .style('display','none')
    
      info.selectAll('.AllianceBars')
        .append('div')
        .attrs({ 'class':'AllianceNames' })
        .html(d => d.key)
    
      info.selectAll('.AllianceBars')
        .append('div')
        .attrs({ 'class':'AllianceBar' })
        .on('mouseover',d => {
          d3.selectAll('.ConstituencyGroup')
            .attrs({ 'opacity': 0.05 })
          d['Party'].forEach(el => {
            d3.selectAll(`.Year_${this.props.yearSelected}_${el.key.replace("(", "_").replace("(", "_").replace(")", "_").replace(")", "_")}`)
              .attrs({ 'opacity': 1 })
          })
        })
        .on('mouseout',this.mouseLeave)

      info.selectAll('.AllianceBar')
        .append('div')
        .attrs({ 'class':'partyNames' })
        .html('All')
    info.selectAll('.AllianceBar')
      .append('div')
      .attrs({ 'class':'AllianceBarsBG' })
    info.selectAll('.AllianceBarsBG')
      .append('div')
      .style('width',d => `${d.value * 100/ 543}%`)
      .style('background-color',d =>  colors['Alliance'][d['key']])
    info.selectAll('.AllianceBarsBG')
      .append('div')
      .attrs({'class':'seatShare'})
      .html(d => `${d.value} (${(d.value*100/543).toFixed(1)}%)`)

    let party_bars = info.selectAll('.AllianceBars')
      .append('div')
    
    party_bars.selectAll('.party_bars')
      .data(d => d['Party'])
      .enter()
      .append('div')
      .attrs({ 'class':'party_bars' })
      .on('mouseover',d => {
        d3.selectAll('.ConstituencyGroup')
          .attrs({ 'opacity': 0.05 })
        d3.selectAll(`.Year_${this.props.yearSelected}_${d.key.replace("(", "_").replace("(", "_").replace(")", "_").replace(")", "_")}`)
          .attrs({ 'opacity': 1 })
      })
      .on('mouseout',this.mouseLeave)
    
      party_bars.selectAll('.party_bars')
        .append('div')
        .attrs({ 'class':'partyNames alliancepartyNames' })
        .html(d => d.key)
      
      party_bars.selectAll('.party_bars')
        .append('div')
        .attrs({ 'class':'partyBarBG' })
      party_bars.selectAll('.partyBarBG')
        .append('div')
        .style('width',d => `${d.value * 100/ 543}%`)
        .style('background-color',d => colors["Alliance"][d['Alliance']])
      party_bars.selectAll('.partyBarBG')
        .append('div')
        .attrs({'class':'seatShare'})
        .html(d => `${d.value} (${(d.value*100/543).toFixed(1)}%)`)
      
    if(this.props.allianceSelected === "Alliance"){
      d3.selectAll(".partyBars").style('display','none')
      d3.selectAll(".AllianceBars").style('display','inline')
    } else {
      d3.selectAll(".AllianceBars").style('display','none')
      d3.selectAll(".partyBars").style('display','flex')
    }
  }
  render() {
    return ( 
      <div>
        <div className='vizArea'>
          <div className={'map'} />
          <div className={'infoSection'}>
            <div className={'infoTitle'}>India <span className='seat_total'>(Total Seats: 543)</span></div>
          </div>
        </div>
        <div className='tooltip'>
          <div className='tooltip_Head'>
            <div className='const_Name'>Contituency</div>
            <div className='Voter_Turnout_tooltip'>Voter TurnOut: <span className='bold Voter_Turnout_Value'>75%</span></div>
          </div>
          <div className='Winner_Info'>
            <div className='Winner_Name bold'>Winner_name</div>
            <div className='Winner_Party bold'>BJP</div>
          </div>
          <div className='Category_Name'>M · GEN</div>
          <div className='Margin_Percent'>Win Margin: <span className='bold Margin_Percent_Value'>75%</span></div>
        </div>
      </div>
    )
  }
}

export default Cartogram
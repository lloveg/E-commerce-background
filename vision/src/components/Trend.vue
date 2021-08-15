<template>
  <div class="com-container">
    <div class="title"  :style="comStyle">
      <span>{{'▎ ' + showTitle}}</span>
      <span class="iconfont title-icon" @click="showChoice = !showChoice" :style="comStyle">&#xe6eb;</span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
          {{item.text}}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref">trend</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from 'utils/theme_utils'

export default {
  name: 'Trend',
  data() {
    return {
      chartInstance: null,
      allData: null,   // 服务器返回的数据
      showChoice: false, // 是否显示可选项
      choiceType: 'map', // 显示的数据类型
      titleFontSize: 0 // 指明标题的字体大小
    }
  },
  created() {
    // 在组件创建完成之后  进行回调函数的注册
    this.$socket.registerCallBack('trendData', this.getDate);
  },
  methods: {
    initOption() {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme);
      const initOption = {
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        },
        grid: {
          top: '35%',
          left: '3%',
          right: '4%',
          bottom: '2%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: '15%',
          left: 25,
          icon: 'circle'
        },
      };
      this.chartInstance.setOption(initOption)
    },
    // ret 就是服务端发送给客户端的图表数据
    getDate(ret) {
      // const ret = await this.$http.get('trend');
      // const {data: ret} = await this.$http.get('trend');
      // console.log(ret);
      this.allData = ret;
      console.log(this.allData);
      this.updateChart();
    },
    updateChart() {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      // 类目轴的数据
      const timeArr = this.allData.common.month;
      // console.log(timeArr);
      // y轴下的数据  series
      const valueArr = this.allData[this.choiceType].data;
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: 'this.choiceType',
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0, color: colorArr1[index]
              },
              {
                offset: 1, color: colorArr2[index]
              }
            ])
          }
        }
      })
      // 图例的数据
      const legendArr = valueArr.map(item => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        series: seriesArr,
        legend: {
          data: legendArr
        }
      };
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter() {
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6;
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    handleSelect(currentType) {
      this.choiceType = currentType;
      this.updateChart();
      this.showChoice = false;
    }
  },
  computed: {
    selectTypes() {
      if(!this.allData) {
        return []
      }else {
        return this.allData.type.filter(item => {
          return item.key != this.choiceType
        })
      }
    },
    showTitle() {
      if(!this.allData) {
        return ''
      }else {
        return this.allData[this.choiceType].title
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    marginStyle() {
      return {
        marginLeft: this.titleFontSize + 'px'
      }
    },
    ...mapState(['theme'])
  },
  mounted() {
    this.initOption();
    // this.getDate();
    // 发送数据给服务器，告诉服务器，我现在需要数据
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    });
    window.addEventListener('resize', this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter);
    // 在组件销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('trendData')
  },
  watch: {
    theme () {
      console.log('主题切换了')
      this.chartInstance.dispose() // 销毁当前的图表
      this.initOption() // 重新以最新的主题名称初始化图表对象
      this.screenAdapter() // 完成屏幕的适配
      this.updateChart() // 更新图表的展示
    }
  }

}
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  color: white;
  top: 20px;
  left: 20px;
  z-index: 10;
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  };
  .select-con {
    background-color: #222733;
    .select-item {
      cursor: pointer;
    }
  }
}
</style>
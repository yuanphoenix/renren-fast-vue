<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('product:brand:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('product:brand:delete')" type="danger" @click="deleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle"
              style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="brandId" header-align="center" align="center" label="品牌id">
      </el-table-column>
      <el-table-column prop="name" header-align="center" align="center" label="品牌名">
      </el-table-column>
      <el-table-column prop="logo" header-align="center" align="center" label="品牌logo地址">
        <template slot-scope="scope">
          <img :src="scope.row.logo" style="height: 80px; width: 80px;">
        </template>
      </el-table-column>
      <el-table-column prop="descript" header-align="center" align="center" label="介绍">
      </el-table-column>
      <el-table-column prop="showStatus" header-align="center" align="center" label="显示状态">

        <template slot-scope="scope">
          <el-switch v-model="scope.row.showStatus" :active-value='1' :inactive-value='0' active-text="启用"
                     inactive-text="禁用" @change="updateStatus(scope.row)">
          </el-switch>
        </template>


      </el-table-column>
      <el-table-column prop="firstLetter" header-align="center" align="center" label="检索首字母">
      </el-table-column>
      <el-table-column prop="sort" header-align="center" align="center" label="排序">
      </el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="updateCatalogHandle(scope.row.brandId)">关联分类</el-button>
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.brandId)">修改</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.brandId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex"
                   :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalPage"
                   layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>


    <el-dialog title="关联分类" :visible.sync="cateRelationDialogVisible" width="30%">
      <el-popover placement="right-end" v-model="popCatalogSelectVisible">
        <category-cascader :catalogPath.sync="catalogPath"></category-cascader>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="popCatalogSelectVisible = false">取消</el-button>
          <el-button type="primary" size="mini" @click="addCatalogSelect">确定</el-button>
        </div>
        <el-button slot="reference">新增关联</el-button>
      </el-popover>
      <el-table :data="cateRelationTableData" style="width: 100%">
        <el-table-column prop="id" label="ID"></el-table-column>
        <el-table-column prop="brandName" label="品牌名"></el-table-column>
        <el-table-column prop="catalogName" label="分类名"></el-table-column>
        <el-table-column fixed="right" header-align="center" align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="deleteCateRelationHandle(scope.row.id,scope.row.brandId)"
            >移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateRelationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cateRelationDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AddOrUpdate from './brand-add-or-update'
import CategoryCascader from '../common/category-cascader'

export default {
  data () {
    return {
      dataForm: {
        key: ''
      },
      brandId: 0,
      catalogPath: [],
      dataList: [],
      cateRelationTableData: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      cateRelationDialogVisible: false,
      popCatalogSelectVisible: false
    }
  },
  components: {
    AddOrUpdate,
    CategoryCascader
  },
  activated () {
    this.getDataList()
  },
  methods: {
    addCatalogSelect () {
      //{"brandId":1,"catalogId":2}
      this.popCatalogSelectVisible = false
      this.$http({
        url: this.$http.gulimalladornUrl('/product/categorybrandrelation/save', 'gateway'),
        method: 'post',
        data: this.$http.adornData({
          brandId: this.brandId,
          catalogId: this.catalogPath[this.catalogPath.length - 1]
        }, false)
      }).then(({data}) => {
        this.getCateRelation()
      })
    },
    deleteCateRelationHandle (id, brandId) {
      this.$http({
        url: this.$http.gulimalladornUrl(`/product/categorybrandrelation/delete/${id}`, 'gateway'),
        method: 'post'
      }).then(({data}) => {
        this.getCateRelation()
      })
    },
    updateCatalogHandle (brandId) {
      // 这是关联首先进入的函数
      this.cateRelationDialogVisible = true
      this.brandId = brandId
      this.getCateRelation()
    },
    getCateRelation () {
      // 这是关联第二步进入的函数
      this.$http({
        url: this.$http.gulimalladornUrl('/product/categorybrandrelation/catalog/list', 'gateway'),
        method: 'get',
        params: this.$http.adornParams({
          brandId: this.brandId
        })
      }).then(({data}) => {
        this.cateRelationTableData = data.data
      })
    },
    // 获取数据列表
    updateStatus (data) {
      let {brandId, showStatus} = data
      this.$http({
        url: this.$http.gulimalladornUrl('/product/brand/update', 'gateway', 'gateway'),
        method: 'post',
        data: this.$http.adornData({brandId, showStatus}, false)
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.getDataList()
        } else {
          this.$message.error(data.msg)
        }
      })

    },
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.gulimalladornUrl('/product/brand/list/page', 'gateway'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'key': this.dataForm.key
        })
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.dataList = data.page.records
          this.totalPage = data.page.total
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },
    // 每页数
    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 当前页
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 多选
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },
    // 新增 / 修改
    addOrUpdateHandle (id) {
      console.log(id)
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
      })
    },
    // 删除
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.brandId
      })
      this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.gulimalladornUrl('/product/brand/delete', 'gateway'),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      })
    }
  }
}
</script>

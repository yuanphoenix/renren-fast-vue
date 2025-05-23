<template>
  <el-dialog :title="!dataForm.attrGroupId ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="96px">
      <el-form-item label="组名" prop="attrGroupName">
        <el-input v-model="dataForm.attrGroupName" placeholder="组名"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="dataForm.sort" placeholder="排序"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="descript">
        <el-input v-model="dataForm.descript" placeholder="描述"></el-input>
      </el-form-item>
      <el-form-item label="组图标" prop="icon">
        <el-input v-model="dataForm.icon" placeholder="组图标"></el-input>
      </el-form-item>
      <el-form-item label="所属分类id" prop="catalogIds">
        <!-- <el-input v-model="dataForm.catalogId" placeholder="所属分类id"></el-input> -->
        <el-cascader filterable placeholder="试试搜索手机" v-model="dataForm.catalogIds" :options="options"
                     :props="defaultProps">
        </el-cascader>

      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {

  props: {
    categoryRef: Object
  },
  data () {
    return {
      options: [],
      defaultProps: {
        value: 'catId',
        label: 'name',
        leaf: 'leaf'
      },
      visible: false,
      dataForm: {
        attrGroupId: 0,
        attrGroupName: '',
        sort: '',
        descript: '',
        icon: '',
        // TODO 这里有个大问题，el-cascader会将路径转到catalogIds，但是我们规则校验的是catalogId。所以只能把那条规则删掉了
        catalogIds: [],
        catalogId: ''
      },
      dataRule: {
        attrGroupName: [
          {required: true, message: '组名不能为空', trigger: 'blur'}
        ],
        sort: [
          {required: true, message: '排序不能为空', trigger: 'blur'}
        ],
        descript: [
          {required: true, message: '描述不能为空', trigger: 'blur'}
        ],
        icon: [
          {required: true, message: '组图标不能为空', trigger: 'blur'}
        ],
        catalogIds: [
          {required: true, message: '所属分类id不能为空', trigger: 'blur'}
        ]
      }
    }
  },

  created () {
    this.getCategorys()
  },

  methods: {
    getCategorys () {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree', 'gateway'),
        method: 'get',
      }).then(({data}) => {
        console.log(data)
        this.options = data.data
      })
    },

    handleChange (value) {
      console.log(value)
    },
    init (id) {
      this.dataForm.attrGroupId = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.attrGroupId) {
          this.$http({
            url: this.$http.adornUrl(`/product/attrgroup/info/${this.dataForm.attrGroupId}`, 'gateway'),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 200) {
              console.log(data.data)
              this.dataForm.attrGroupName = data.data.attrGroupName
              this.dataForm.sort = data.data.sort
              this.dataForm.descript = data.data.descript
              this.dataForm.icon = data.data.icon
              this.dataForm.catalogId = data.data.catalogId
              this.dataForm.catalogIds = []
              let node = this.categoryRef.$refs.tree.getNode(data.data.catalogId)
              while (node != null) {
                this.dataForm.catalogIds.push(node.data.catId)
                node = node.parent
              }
              this.dataForm.catalogIds.reverse()
            }
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/product/attrgroup/${!this.dataForm.attrGroupId ? 'save' : 'update'}`, 'gateway'),
            method: 'post',
            data: this.$http.adornData({
              'attrGroupId': this.dataForm.attrGroupId || undefined,
              'attrGroupName': this.dataForm.attrGroupName,
              'sort': this.dataForm.sort,
              'descript': this.dataForm.descript,
              'icon': this.dataForm.icon,
              'catalogId': this.dataForm.catalogIds[this.dataForm.catalogIds.length - 1]
            })
          }).then(({data}) => {
            if (data && data.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      })
    }
  }
}
</script>

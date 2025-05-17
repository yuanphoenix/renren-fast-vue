<template>
  <el-dialog :title="!dataForm.brandId ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
      label-width="140px">
      <el-form-item label="品牌名" prop="name">
        <el-input v-model="dataForm.name" placeholder="品牌名"></el-input>
      </el-form-item>
      <el-form-item label="品牌logo地址" prop="logo">

        <el-upload class="upload-demo" action="#" list-type="picture" :http-request="customUpload"
          :on-preview="handlePreview" :before-upload="beforeUpload" :on-remove="handleRemove"
          :before-remove="beforeRemove" :multiple="false" :limit="1" :on-exceed="handleExceed" :file-list="fileList">
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>


      </el-form-item>
      <el-form-item label="介绍" prop="descript">
        <el-input v-model="dataForm.descript" placeholder="介绍"></el-input>
      </el-form-item>
      <el-form-item label="显示状态" prop="showStatus">
        <el-switch v-model="dataForm.showStatus" :active-value='1' :inactive-value='0' active-text="启用"
          inactive-text="禁用">
        </el-switch>
      </el-form-item>
      <el-form-item label="检索首字母" prop="firstLetter">
        <el-input v-model="dataForm.firstLetter" placeholder="检索首字母"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model.number="dataForm.sort" placeholder="排序"></el-input>
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
  data() {
    return {
      fileList: [],
      visible: false,
      dataForm: {
        brandId: 0,
        name: '',
        logo: '',
        descript: '',
        showStatus: '',
        firstLetter: '',
        sort: 0
      },
      dataRule: {
        name: [
          { required: true, message: '品牌名不能为空', trigger: 'blur' }
        ],
        logo: [
          { required: true, message: '品牌logo地址不能为空', trigger: 'blur' }
        ],
        descript: [
          { required: true, message: '介绍不能为空', trigger: 'blur' }
        ],
        showStatus: [
          { required: true, message: '显示状态', trigger: 'blur' }
        ],
        firstLetter: [
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() === "") {
                callback(new Error('不能为空'));
              } else if (!/^[a-zA-Z]$/.test(value)) {
                callback(new Error("首字母必须a-z或者A-Z之间"));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        sort: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('不能为空'));
              } else if (!Number.isInteger(value) || value < 0) {
                callback(new Error("首字母必须大于等于0"));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    customUpload(file) {
      const uploadHost = "https://gulimall--tifa.oss-cn-beijing.aliyuncs.com";
      this.$http({
        url: this.$http.adornUrl('/oss/get_post_signature_for_oss_upload', 'gateway'),
        method: "get"
      }).then(({ data }) => {
        console.log(data)
        const objectKey = `${data.dir}${data.key}${file.file.name}`;

        let formData = new FormData();
        formData.append("success_action_status", "200");
        formData.append("policy", data.policy);
        formData.append("x-oss-signature", data.signature);
        formData.append("x-oss-signature-version", "OSS4-HMAC-SHA256");
        formData.append("x-oss-credential", data.x_oss_credential);
        formData.append("x-oss-date", data.x_oss_date);
        formData.append("key", objectKey); // 文件名
        formData.append("x-oss-security-token", data.security_token);
        formData.append("file", file.file); // file 必须为最后一个表单域


        fetch("https://gulimall--tifa.oss-cn-beijing.aliyuncs.com", {
          method: "POST",
          body: formData
        }).then((response) => {
          console.log(response)
          if (response.status === 200) {
            this.$message({
              message: '上传成功',
              type: 'success',
              duration: 1500,
            })
            this.dataForm.logo = uploadHost + "/" + objectKey
            console.log("文件地址", this.dataForm.logo)


          } else {
            this.$message.error("上传失败")
          }
        })

      })

    },

    beforeUpload(file) {
      console.log(file)
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },


    init(id) {
      this.dataForm.brandId = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()

        if (this.dataForm.brandId) {
          this.$http({
            url: this.$http.adornUrl(`/product/brand/info/${this.dataForm.brandId}`, "gateway"),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 200) {
              this.dataForm.name = data.data.name
              this.dataForm.logo = data.data.logo
              this.fileList = data.data.name
                ? [{
                  name: data.data.name,
                  url: data.data.logo
                }]
                : [];

              this.dataForm.descript = data.data.descript
              this.dataForm.showStatus = data.data.showStatus
              this.dataForm.firstLetter = data.data.firstLetter
              this.dataForm.sort = data.data.sort
            }
          })
        } else {
          this.fileList = []
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/product/brand/${!this.dataForm.brandId ? 'save' : 'update'}`, "gateway"),
            method: 'post',
            data: this.$http.adornData({
              'brandId': this.dataForm.brandId || undefined,
              'name': this.dataForm.name,
              'logo': this.dataForm.logo,
              'descript': this.dataForm.descript,
              'showStatus': this.dataForm.showStatus,
              'firstLetter': this.dataForm.firstLetter,
              'sort': this.dataForm.sort
            })
          }).then(({ data }) => {
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
